"""Build stable portraits and 4x6 walking sheets from irregular source grids."""

from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / "images" / "character-sprites"
SOURCE_ROOT = ASSET_ROOT / "source-v2"
PORTRAIT_ROOT = ASSET_ROOT / "portraits"
WALKING_ROOT = ASSET_ROOT / "walking"

CHARACTER_IDS = [
    "dualblade-male", "dualblade-female", "monk-male", "monk-female",
    "druid-male", "druid-female", "bard-male", "bard-female",
    "ranger-male", "ranger-female", "barbarian-male", "barbarian-female",
    "cleric-male", "cleric-female", "knight-male", "knight-female",
    "rogue-male", "rogue-female", "alchemist-male", "alchemist-female",
    "axe-warrior-male", "axe-warrior-female", "blue-mage-male", "blue-mage-female",
    "blue-warrior-male", "blue-warrior-female", "battlemage-male", "battlemage-female",
    "axe-mage-male", "axe-mage-female", "blood-axe-male", "blood-axe-female",
]

# Image generation and the supplied examples do not all contain the requested
# six source rows. These are the verified exceptions. Five-row sheets repeat a
# centered stride; the seven-row alchemist sheet drops its cropped final row.
SOURCE_ROW_COUNTS = {
    "dualblade-male": 5,
    "alchemist-female": 7,
    "axe-warrior-male": 5,
    "blue-mage-female": 5,
    "blue-warrior-female": 5,
}

MAP_FRAME_WIDTH = 80
MAP_FRAME_HEIGHT = 80
MAP_BODY_HEIGHT = 48


def connected_components(alpha: np.ndarray, threshold: int = 36):
    """Return 8-connected opaque components without assuming regular spacing."""
    mask = alpha >= threshold
    height, width = mask.shape
    visited = np.zeros(mask.shape, dtype=np.bool_)
    components = []

    for start_y, start_x in np.argwhere(mask):
        if visited[start_y, start_x]:
            continue
        queue = deque([(int(start_x), int(start_y))])
        visited[start_y, start_x] = True
        pixels = []
        sum_x = 0
        sum_y = 0
        min_x = max_x = int(start_x)
        min_y = max_y = int(start_y)

        while queue:
            x, y = queue.popleft()
            pixels.append((x, y))
            sum_x += x
            sum_y += y
            min_x = min(min_x, x)
            max_x = max(max_x, x)
            min_y = min(min_y, y)
            max_y = max(max_y, y)
            for next_y in range(max(0, y - 1), min(height, y + 2)):
                for next_x in range(max(0, x - 1), min(width, x + 2)):
                    if mask[next_y, next_x] and not visited[next_y, next_x]:
                        visited[next_y, next_x] = True
                        queue.append((next_x, next_y))

        area = len(pixels)
        components.append({
            "pixels": pixels,
            "area": area,
            "cx": sum_x / area,
            "cy": sum_y / area,
            "box": (min_x, min_y, max_x + 1, max_y + 1),
        })
    return components


def dilate(mask: np.ndarray, passes: int = 2) -> np.ndarray:
    """Restore anti-aliased edge pixels around the selected solid component."""
    result = mask.copy()
    for _ in range(passes):
        expanded = result.copy()
        expanded[1:, :] |= result[:-1, :]
        expanded[:-1, :] |= result[1:, :]
        expanded[:, 1:] |= result[:, :-1]
        expanded[:, :-1] |= result[:, 1:]
        expanded[1:, 1:] |= result[:-1, :-1]
        expanded[:-1, :-1] |= result[1:, 1:]
        expanded[1:, :-1] |= result[:-1, 1:]
        expanded[:-1, 1:] |= result[1:, :-1]
        result = expanded
    return result


def isolate_grid(image: Image.Image, columns: int, rows: int):
    """Assign complete connected figures to their nearest logical grid cell."""
    rgba = np.asarray(image.convert("RGBA"))
    alpha = rgba[:, :, 3]
    height, width = alpha.shape
    groups = [[[] for _ in range(columns)] for _ in range(rows)]

    for component in connected_components(alpha):
        column = min(columns - 1, max(0, int(component["cx"] * columns / width)))
        row = min(rows - 1, max(0, int(component["cy"] * rows / height)))
        groups[row][column].append(component)

    isolated = []
    for row in range(rows):
        for column in range(columns):
            group = groups[row][column]
            if not group:
                isolated.append(Image.new("RGBA", image.size))
                continue
            largest = max(component["area"] for component in group)
            minimum_area = max(10, int(largest * 0.004))
            selected = np.zeros(alpha.shape, dtype=np.bool_)
            for component in group:
                if component["area"] < minimum_area:
                    continue
                for x, y in component["pixels"]:
                    selected[y, x] = True
            selected = dilate(selected, 2) & (alpha > 0)
            output = rgba.copy()
            output[~selected] = 0
            isolated.append(Image.fromarray(output, "RGBA"))
    return isolated


def alpha_box(image: Image.Image):
    alpha = np.asarray(image)[:, :, 3]
    ys, xs = np.nonzero(alpha)
    if not len(xs):
        return (0, 0, 1, 1)
    return (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)


def paste_fitted(
    canvas, source, box, destination, scale=None, bottom_align=True, source_anchor_x=None
):
    left, top, right, bottom = box
    crop = source.crop(box)
    dest_x, dest_y, dest_w, dest_h = destination
    if scale is None:
        scale = min(dest_w / crop.width, dest_h / crop.height)
    width = max(1, round(crop.width * scale))
    height = max(1, round(crop.height * scale))
    resized = crop.resize((width, height), Image.Resampling.NEAREST)
    if source_anchor_x is None:
        x = dest_x + (dest_w - width) // 2
    else:
        anchor_offset = (source_anchor_x - left) * scale
        x = round(dest_x + dest_w / 2 - anchor_offset)
    y = dest_y + dest_h - height if bottom_align else dest_y + (dest_h - height) // 2
    canvas.alpha_composite(resized, (x, y))


def build_portraits():
    source = Image.open(SOURCE_ROOT / "portrait-roster.png").convert("RGBA")
    figures = isolate_grid(source, 8, 4)
    PORTRAIT_ROOT.mkdir(parents=True, exist_ok=True)
    for character_id, figure in zip(CHARACTER_IDS, figures):
        portrait = Image.new("RGBA", (192, 192))
        paste_fitted(portrait, figure, alpha_box(figure), (6, 6, 180, 180), bottom_align=True)
        portrait.save(PORTRAIT_ROOT / f"{character_id}.png")


def normalize_walking_sheet(source_path: Path, character_id: str):
    source = Image.open(source_path).convert("RGBA")
    source_rows = SOURCE_ROW_COUNTS.get(character_id, 6)
    source_frames = isolate_grid(source, 4, source_rows)
    if source_rows == 5:
        selected_rows = [0, 1, 2, 2, 3, 4]
    elif source_rows == 7:
        selected_rows = [0, 1, 2, 3, 4, 5]
    else:
        selected_rows = list(range(6))
    frames = [
        source_frames[source_row * 4 + column]
        for source_row in selected_rows
        for column in range(4)
    ]
    boxes = [alpha_box(frame) for frame in frames]
    anchors = []
    for frame, (left, top, right, bottom) in zip(frames, boxes):
        alpha = np.asarray(frame)[:, :, 3]
        lower_top = top + round((bottom - top) * 0.62)
        _, lower_xs = np.nonzero(alpha[lower_top:bottom, left:right])
        anchor = left + (float(np.median(lower_xs)) if len(lower_xs) else (right - left) / 2)
        anchors.append(anchor)
    maximum_side = max(
        max(anchor - left, right - anchor)
        for anchor, (left, _, right, _) in zip(anchors, boxes)
    )
    maximum_height = max(bottom - top for _, top, _, bottom in boxes)
    common_scale = min(14 / maximum_side, 61 / maximum_height)

    sheet = Image.new("RGBA", (128, 384))
    for index, (frame, box, anchor) in enumerate(zip(frames, boxes, anchors)):
        row, column = divmod(index, 4)
        paste_fitted(
            sheet,
            frame,
            box,
            (column * 32 + 1, row * 64 + 1, 30, 62),
            common_scale,
            True,
            anchor,
        )
    sheet.save(WALKING_ROOT / f"{character_id}.png")


def normalize_map_character_sizes():
    """Give every overworld character the same lower-body-based visual scale."""
    for character_id in CHARACTER_IDS:
        path = WALKING_ROOT / f"{character_id}.png"
        source = Image.open(path).convert("RGBA")
        source_frame_width = source.width // 4
        source_frame_height = source.height // 6
        frames = [
            source.crop((
                column * source_frame_width,
                row * source_frame_height,
                (column + 1) * source_frame_width,
                (row + 1) * source_frame_height,
            ))
            for row in range(6)
            for column in range(4)
        ]
        boxes = [alpha_box(frame) for frame in frames]
        body_heights = []
        anchors = []
        for frame, (left, top, right, bottom) in zip(frames, boxes):
            alpha = np.asarray(frame)[:, :, 3]
            row_counts = (alpha > 0).sum(axis=1)
            dense_rows = np.where(row_counts >= max(2, row_counts.max() * 0.2))[0]
            body_heights.append(int(dense_rows.max() - dense_rows.min() + 1))
            lower_top = top + round((bottom - top) * 0.62)
            _, lower_xs = np.nonzero(alpha[lower_top:bottom, left:right])
            anchors.append(left + (float(np.median(lower_xs)) if len(lower_xs) else (right - left) / 2))

        body_scale = MAP_BODY_HEIGHT / float(np.median(body_heights))
        maximum_side = max(
            max(anchor - left, right - anchor)
            for anchor, (left, _, right, _) in zip(anchors, boxes)
        )
        maximum_height = max(bottom - top for _, top, _, bottom in boxes)
        common_scale = min(
            body_scale,
            (MAP_FRAME_WIDTH / 2 - 2) / maximum_side,
            (MAP_FRAME_HEIGHT - 2) / maximum_height,
        )

        sheet = Image.new("RGBA", (MAP_FRAME_WIDTH * 4, MAP_FRAME_HEIGHT * 6))
        for index, (frame, box, anchor) in enumerate(zip(frames, boxes, anchors)):
            row, column = divmod(index, 4)
            paste_fitted(
                sheet,
                frame,
                box,
                (column * MAP_FRAME_WIDTH + 1, row * MAP_FRAME_HEIGHT + 1, MAP_FRAME_WIDTH - 2, MAP_FRAME_HEIGHT - 2),
                common_scale,
                True,
                anchor,
            )
        sheet.save(path)


def build_walking_sheets():
    WALKING_ROOT.mkdir(parents=True, exist_ok=True)
    sources = {}
    for folder in (SOURCE_ROOT / "examples", SOURCE_ROOT / "generated"):
        for path in folder.glob("*.png"):
            if not path.stem.endswith("-keyed"):
                sources[path.stem] = path
    for character_id in CHARACTER_IDS:
        normalize_walking_sheet(sources[character_id], character_id)
    normalize_map_character_sizes()


if __name__ == "__main__":
    build_portraits()
    build_walking_sheets()
    print(f"Built {len(CHARACTER_IDS)} isolated portraits and stable 4x6 walking sheets.")
