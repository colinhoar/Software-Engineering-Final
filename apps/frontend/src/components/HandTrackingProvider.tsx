import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react'
import { createPortal } from 'react-dom'
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection'
import '@tensorflow/tfjs-backend-webgl'
import '@mediapipe/hands'
import { useSessionStorage } from '@uidotdev/usehooks';

const SCALE = 2.5
const SMOOTH = 0.10
const DEAD = 1.5
const FLIP_X = -1
const PINCH_IN = 25
const PINCH_OUT = 40
const HOLD_FRAMES = 2
const SCROLL_SCALE = 2.0

interface Ctx { enabled: boolean; toggle: () => void }
const HandCtx = createContext<Ctx>({ enabled: false, toggle: () => {} })
export const useHandTracking = () => useContext(HandCtx)

export const HandTrackingProvider = ({
                                         children,
                                     }: {
    children: React.ReactNode
}) => {
    const [enabled, setEnabled] = useSessionStorage('handsfreeEnabled', false)
    const toggle = () => setEnabled(v => !v)
    const [enableMic, setEnableMic] = useSessionStorage('handMic', false)

    const videoRef = useRef<HTMLVideoElement | null>(null)
    const dotRef   = useRef<HTMLDivElement   | null>(null)

    const px = useRef(window.innerWidth  / 2)
    const py = useRef(window.innerHeight / 2)
    const vx = useRef(0)
    const vy = useRef(0)

    const prevFinger = useRef<{ x: number; y: number } | null>(null)
    const pinchState = useRef<'open'|'closing'|'closed'>('open')
    const pinchHold  = useRef(0)

    const twoPinchState = useRef<'open'|'closing'|'closed'>('open')
    const twoPinchHold  = useRef(0)

    const fistPrevY = useRef<number | null>(null)  // for two-fist scroll

    const nearestClickableAncestor = (node: Element | null): HTMLElement | null => {
        while (node && node instanceof HTMLElement) {
            if (
                node.tabIndex >= 0 ||
                node instanceof HTMLButtonElement ||
                node instanceof HTMLSelectElement ||
                node instanceof HTMLInputElement ||
                node.getAttribute('role') === 'button'
            ) return node
            node = node.parentElement
        }
        return null
    }

    const fireClick = (el: HTMLElement) => {
        if (el instanceof HTMLButtonElement || el.getAttribute('role') === 'button') {
            el.click()
            return
        }
        if (el instanceof HTMLInputElement) {
            el.focus()
            return
        }
        if (el instanceof HTMLSelectElement) {
            el.focus()
            const opts: PointerEventInit & MouseEventInit = {
                bubbles: true, cancelable: true,
                view: window, clientX: px.current, clientY: py.current,
                button: 0, pointerType: 'mouse', isPrimary: true
            }
            el.dispatchEvent(new PointerEvent('pointerdown', opts))
            el.dispatchEvent(new MouseEvent('mousedown', opts))
            el.dispatchEvent(new PointerEvent('pointerup', opts))
            el.dispatchEvent(new MouseEvent('mouseup', opts))
            el.dispatchEvent(new MouseEvent('click', opts))
            return
        }
        const opts: PointerEventInit & MouseEventInit = {
            bubbles: true, cancelable: true,
            view: window, clientX: px.current, clientY: py.current,
            button: 0, pointerType: 'mouse', isPrimary: true
        }
        el.dispatchEvent(new PointerEvent('pointerdown', opts))
        el.dispatchEvent(new MouseEvent('mousedown', opts))
        el.dispatchEvent(new PointerEvent('pointerup', opts))
        el.dispatchEvent(new MouseEvent('mouseup', opts))
        el.dispatchEvent(new MouseEvent('click', opts))
    }

    useEffect(() => {
        if (!enabled) return

        const vid = Object.assign(document.createElement('video'), {
            autoplay: true,
            playsInline: true,
            muted: true
        })
        Object.assign(vid.style, {
            position: 'fixed',
            right:    '10px',
            bottom:   '10px',
            width:    '160px',
            height:   '100px',
            border:   '2px solid red',
            zIndex:    9999,
        })
        document.body.appendChild(vid)
        videoRef.current = vid

        navigator.mediaDevices
            .getUserMedia({ video: { width: 1280, height: 720 } })
            .then(async stream => {
                vid.srcObject = stream
                await vid.play()

                const detector = await handPoseDetection.createDetector(
                    handPoseDetection.SupportedModels.MediaPipeHands,
                    {
                        runtime:     'mediapipe',
                        modelType:    'lite',
                        maxHands:     2,
                        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
                    }
                )

                const loop = async () => {
                    const video = videoRef.current!, dot = dotRef.current!
                    const hands = await detector.estimateHands(video)

                    // Single-hand pinch = click element under dot
                    if (hands.length >= 1) {
                        const pts = hands[0].keypoints
                        const idx = pts.find(k => k.name === 'index_finger_tip')
                        if (idx && pinchState.current === 'open') {
                            const curr = { x: idx.x, y: idx.y }
                            if (prevFinger.current) {
                                let dx = (curr.x - prevFinger.current.x) * FLIP_X
                                let dy =  curr.y - prevFinger.current.y
                                if (Math.abs(dx) < DEAD) dx = 0
                                if (Math.abs(dy) < DEAD) dy = 0
                                dx *= SCALE; dy *= SCALE
                                vx.current = vx.current * (1 - SMOOTH) + dx * SMOOTH
                                vy.current = vy.current * (1 - SMOOTH) + dy * SMOOTH
                                px.current = Math.min(window.innerWidth,  Math.max(0, px.current + vx.current))
                                py.current = Math.min(window.innerHeight, Math.max(0, py.current + vy.current))
                                dot.style.left = `${px.current}px`
                                dot.style.top  = `${py.current}px`
                            }
                            prevFinger.current = curr
                        }
                        const tip = pts.find(k => k.name === 'index_finger_tip')
                        const th  = pts.find(k => k.name === 'thumb_tip')
                        if (tip && th) {
                            const dist = Math.hypot(tip.x - th.x, tip.y - th.y)
                            if (pinchState.current === 'open' && dist < PINCH_IN) {
                                pinchState.current = 'closing'; pinchHold.current = 0
                            }
                            if (pinchState.current === 'closing') {
                                if (dist < PINCH_IN && ++pinchHold.current >= HOLD_FRAMES) {
                                    pinchState.current = 'closed'
                                    const raw = document.elementFromPoint(px.current, py.current) as HTMLElement|null
                                    const el  = nearestClickableAncestor(raw)
                                    if (el) fireClick(el)
                                } else if (dist >= PINCH_IN) {
                                    pinchState.current = 'open'
                                }
                            }
                            if (pinchState.current === 'closed' && dist > PINCH_OUT) {
                                pinchState.current = 'open'
                            }
                        } else {
                            pinchState.current = 'open'
                        }
                    }

                    // Two-hand pinch = set mic-on flag
                    if (hands.length >= 2) {
                        const p0 = hands[0].keypoints, p1 = hands[1].keypoints

                        // true pinch = thumb/index close AND index finger extended
                        const isTruePinch = (pts: typeof p0) => {
                            const tip = pts.find(k => k.name === 'index_finger_tip')
                            const th  = pts.find(k => k.name === 'thumb_tip')
                            if (!tip || !th) return false
                            const d = Math.hypot(tip.x - th.x, tip.y - th.y)
                            if (d > PINCH_IN) return false
                            const mcp = pts.find(k => k.name === 'index_finger_mcp')
                            if (mcp) {
                                const ext = Math.hypot(tip.x - mcp.x, tip.y - mcp.y)
                                if (ext < PINCH_OUT) return false
                            }
                            return true
                        }
                        const pinch0 = isTruePinch(p0)
                        const pinch1 = isTruePinch(p1)

                        if (pinch0 && pinch1) {
                            if (twoPinchState.current === 'open') {
                                twoPinchState.current = 'closing'; twoPinchHold.current = 0
                            }
                            if (twoPinchState.current === 'closing') {
                                if (++twoPinchHold.current >= HOLD_FRAMES) {
                                    twoPinchState.current = 'closed'
                                    setEnableMic(true)
                                    twoPinchState.current = 'open'
                                }
                            }
                        } else {
                            twoPinchState.current = 'open'; twoPinchHold.current = 0
                        }
                    }

                    // Two closed fists moving vertically = scroll page this doesnt work but its fine
                    if (hands.length >= 2) {
                        const p0 = hands[0].keypoints
                        const p1 = hands[1].keypoints
                        const palm0 = p0.find(k => k.name === 'index_finger_mcp')
                        const palm1 = p1.find(k => k.name === 'index_finger_mcp')
                        const isFist = (pts: typeof p0, palm: { x: number; y: number } | undefined) => {
                            if (!palm) return false
                            return ['index_finger_tip','middle_finger_tip','ring_finger_tip','pinky_finger_tip','thumb_tip']
                                .every(name => {
                                    const tip = pts.find(k => k.name === name)
                                    if (!tip) return false
                                    const d = Math.hypot(tip.x - palm.x, tip.y - palm.y)
                                    return d < PINCH_IN
                                })
                        }
                        if (palm0 && palm1 && isFist(p0, palm0) && isFist(p1, palm1)) {
                            const avgY = (palm0.y + palm1.y) / 2
                            if (fistPrevY.current !== null) {
                                const dy = avgY - fistPrevY.current
                                window.scrollBy(0, dy * SCROLL_SCALE)
                            }
                            fistPrevY.current = avgY
                        } else {
                            fistPrevY.current = null
                        }
                    }

                    requestAnimationFrame(loop)
                }

                loop()
            })

        return () => {
            videoRef.current?.remove()
        }
    }, [enabled])

    const portal = enabled && createPortal(
        <div
            ref={dotRef}
            style={{
                position:'fixed',
                left:px.current,
                top: py.current,
                width:32, height:32,
                backgroundColor:'red',
                border:'3px solid white',
                borderRadius:'50%',
                boxShadow:'0 0 12px rgba(255,0,0,0.9)',
                pointerEvents:'none',
                zIndex:2147483647,
            }}
        />,
        document.body
    )

    return (
        <HandCtx.Provider value={{ enabled, toggle }}>
            {children}
            {portal}
        </HandCtx.Provider>
    )
}
