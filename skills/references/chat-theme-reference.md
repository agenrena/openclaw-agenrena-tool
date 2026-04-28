# Chat Theme Reference

Chat themes control the visual style of the user's messaging UI. They are
separate from card themes and can only be edited while they are drafts.

## Draft Workflow

1. List editable chat theme drafts.
2. Choose the draft the user asked to edit.
3. If the target draft is ambiguous, ask the user which draft to use.
4. Update the draft's `chat_theme` JSON.
5. If using image backgrounds, upload the image files for each image-backed
   variant.
6. Tell the user the draft is ready for review in the Agenrena app.

## Plugin Tools

- List drafts: `agenrena_list_draft_chat_themes`
- Update draft: `agenrena_update_chat_theme_draft`
- Upload background: `agenrena_upload_chat_theme_background`

The update payload sends only:

```json
{
  "theme_id": "uuid",
  "chat_theme": {
    "light": {},
    "dark": {}
  }
}
```

Do not send `name`, create new drafts, submit drafts, or apply approved themes.

## Background Image Requirements

- Supported content types: `image/jpeg`, `image/png`
- Maximum upload size: 2MB
- Recommended aspect ratio: portrait or flexible cover-friendly image
- The frontend renders image backgrounds in cover mode
- Avoid text-heavy images because messages and composer UI render on top
- Ensure both light and dark variants remain readable after image backgrounds
  are applied

The background upload tool returns an `image_url`. Use that URL in the matching
variant when `background.type` is `image`.

## JSON Structure

Both `light` and `dark` are required and must have the same structure:

```json
{
  "light": {
    "...": "theme variant"
  },
  "dark": {
    "...": "theme variant"
  }
}
```

## Variant Structure

Each variant must include:

```json
{
  "background": {
    "type": "solid",
    "color": "#FFFFFF"
  },
  "bubble_self": {
    "color": "#DCF8C6",
    "border_radius": 20,
    "border_radius_grouped": 6
  },
  "bubble_other": {
    "color": "#F0F0F0",
    "border_radius": 20,
    "border_radius_grouped": 6
  },
  "text_self_color": "#000000",
  "text_other_color": "#000000",
  "timestamp_self_color": "#00000099",
  "timestamp_other_color": "#00000099",
  "date_chip": {
    "background_color": "#E0E0E0BB",
    "text_color": "#333333"
  },
  "composer": {
    "background_color": "#FFFFFFCC",
    "input_background_color": "#F5F5F5CC",
    "icon_color": "#00000080",
    "text_color": "#000000",
    "hint_color": "#00000050"
  },
  "accent_color": "#128C7E",
  "link_preview": {
    "background_self": "#00000014",
    "background_other": "#0000000A",
    "description_self_color": "#000000B3",
    "description_other_color": "#000000B3"
  }
}
```

## Color Format

All colors must be hex strings:

- `#RRGGBB`
- `#RRGGBBAA`

Use alpha carefully. Text, icons, and timestamps must remain readable over
bubbles and backgrounds.

## Background

`background.type` must be one of:

- `solid`
- `gradient`
- `image`

Solid:

```json
{
  "type": "solid",
  "color": "#1A1A2E"
}
```

Gradient:

```json
{
  "type": "gradient",
  "gradient": {
    "type": "linear",
    "colors": ["#1A1A2E", "#16213E", "#0F3460"],
    "stops": [0, 0.5, 1],
    "begin": "topCenter",
    "end": "bottomCenter"
  }
}
```

Gradient fields:

- `type`: `linear` or `radial`
- `colors`: 2 to 5 hex colors
- `stops`: 2 to 5 numbers from 0 to 1
- `begin` and `end`: one of `topLeft`, `topCenter`, `topRight`,
  `centerLeft`, `center`, `centerRight`, `bottomLeft`, `bottomCenter`,
  `bottomRight`

Keep `colors` and `stops` the same length.

Image:

```json
{
  "type": "image",
  "image_url": "https://cdn.example.com/chat-themes/<theme_id>/bg-light.jpg"
}
```

Use `agenrena_upload_chat_theme_background` to obtain the final `image_url`.

## Field Rules

| Field | Type | Rule |
|---|---|---|
| `bubble_self.color` | hex | Required |
| `bubble_self.border_radius` | number | 8 to 24 |
| `bubble_self.border_radius_grouped` | number | 2 to 8 |
| `bubble_other.color` | hex | Required |
| `bubble_other.border_radius` | number | 8 to 24 |
| `bubble_other.border_radius_grouped` | number | 2 to 8 |
| `text_self_color` | hex | Required |
| `text_other_color` | hex | Required |
| `timestamp_self_color` | hex | Required |
| `timestamp_other_color` | hex | Required |
| `date_chip.background_color` | hex | Required |
| `date_chip.text_color` | hex | Required |
| `composer.background_color` | hex | Required |
| `composer.input_background_color` | hex | Required |
| `composer.icon_color` | hex | Required |
| `composer.text_color` | hex | Required |
| `composer.hint_color` | hex | Required |
| `accent_color` | hex | Required |
| `link_preview.background_self` | hex | Required |
| `link_preview.background_other` | hex | Required |
| `link_preview.description_self_color` | hex | Required |
| `link_preview.description_other_color` | hex | Required |

Unknown fields are rejected.

## Quality Checklist

- Both `light` and `dark` variants are complete
- All colors are valid hex strings
- Message text has strong contrast against bubble colors
- Timestamp colors are readable but visually secondary
- Composer text and icons remain readable over the composer background
- Date chip remains readable over the background
- Link preview backgrounds are visible inside their bubbles
- Image backgrounds do not make messages difficult to read
- If using image backgrounds, upload the image and verify `image_url` is present
