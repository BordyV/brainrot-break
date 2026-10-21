import type { ClientModule } from 'claude-code'

import { KEYS } from './keys'

// An invisible layer over the video that turns clicks into taps:
// one tap pauses, two quick taps like, as on TikTok. A click gives it the
// keyboard, so it takes the feed's keys (and ?, which no Button hotkey can be).

type Props = { columns: number; rows: number }
type State = { last: number }

const DOUBLE_TAP_MS = 350

const Tap: ClientModule<Props, State> = (props, surface) => {
  if (surface.state === undefined) {
    surface.setState({ last: 0 })
    surface.onPointer(e => {
      if (e.type !== 'down' || e.button !== 'left') return
      const now = Date.now()
      const isDouble = now - (surface.state?.last ?? 0) < DOUBLE_TAP_MS
      // Where the tap landed, as a fraction of the region, for the heart.
      const fx = (e.x + 0.5) / Math.max(1, surface.columns)
      const fy = (e.y + 0.5) / Math.max(1, surface.rows)
      surface.post({ tap: isDouble ? 'double' : 'single', x: e.x, y: e.y, fx, fy })
      surface.setState({ last: isDouble ? 0 : now })
    })
    surface.onKey(e => {
      const act = KEYS[e.key]
      if (act) surface.post({ act })
    })
  }
  const { Box } = surface.elements
  return <Box width={props.columns} height={props.rows} />
}

export default Tap
