import type { ClientModule } from 'claude-code'

import { KEYS } from './keys'

// The desktop app's controls: rows of text that turn a click, or a key once
// clicked, into an action posted to the hooks module. The desktop drops a
// Button's mouse press when the pane redraws under it; this region keeps
// its listeners across redraws, so the press always lands.
//
// A row can be made of parts, each with its own colour and action, laid out
// left to right: a click lands on the part under it (the caption's hashtags).

type Part = { text: string; act?: string; color?: string }
type Row = { text: string; act?: string; color?: string; bold?: boolean; dim?: boolean; parts?: Part[] }
type Props = { rows: Row[]; width: number; isLeft?: boolean }
type State = { rows: Row[] }


// The action under column x of a row of parts (drawn from the left).
function partAt(parts: Part[], x: number): string | undefined {
  let from = 0
  for (const p of parts) {
    const to = from + [...p.text].length
    if (x >= from && x < to) return p.act
    from = to
  }
  return undefined
}

const Controls: ClientModule<Props, State> = (props, surface) => {
  if (surface.state === undefined) {
    surface.onPointer(e => {
      if (e.type !== 'down' || e.button !== 'left') return
      const row = surface.state?.rows[e.y]
      const act = row?.parts ? partAt(row.parts, e.x) : row?.act
      if (act) surface.post({ act })
    })
    surface.onKey(e => {
      const act = KEYS[e.key]
      if (act) surface.post({ act })
    })
  }
  // The listeners read the rows drawn last, so a redraw with new props keeps them right.
  if (surface.state?.rows !== props.rows) surface.setState({ rows: props.rows })

  const { Box, Text } = surface.elements
  const pad = (s: string) => {
    const chars = [...s].slice(0, props.width)
    const room = props.width - chars.length
    const before = props.isLeft ? 0 : Math.floor(room / 2)
    return ' '.repeat(before) + chars.join('') + ' '.repeat(room - before)
  }
  return (
    <Box flexDirection="column" width={props.width}>
      {props.rows.map(row =>
        row.parts ? (
          <Text>
            {row.parts.map(p => (p.color ? <Text color={p.color}>{p.text}</Text> : <Text>{p.text}</Text>))}
            {' '.repeat(Math.max(0, props.width - [...row.text].length))}
          </Text>
        ) : row.color ? (
          <Text color={row.color} bold={row.bold ?? false} dimColor={row.dim ?? false}>
            {pad(row.text)}
          </Text>
        ) : (
          <Text bold={row.bold ?? false} dimColor={row.dim ?? false}>
            {pad(row.text)}
          </Text>
        ),
      )}
    </Box>
  )
}

export default Controls
