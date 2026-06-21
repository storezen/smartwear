import type { ReactElement, MutableRefObject } from "react"

interface GlobeMethods {
  controls: () => {
    autoRotate: boolean
    autoRotateSpeed: number
    enableDamping: boolean
    dampingFactor: number
    minDistance: number
    maxDistance: number
  }
  pointOfView: (pos: { lat?: number; lng?: number; altitude?: number }, transitionMs?: number) => GlobeMethods
  globeImageUrl: (url: string) => GlobeMethods
  backgroundImageUrl: (url: string) => GlobeMethods
  pointsData: (data: any[]) => GlobeMethods
  pointLat: (accessor: string | ((d: any) => number)) => GlobeMethods
  pointLng: (accessor: string | ((d: any) => number)) => GlobeMethods
  pointAltitude: (accessor: string | number | ((d: any) => number)) => GlobeMethods
  pointRadius: (accessor: string | number | ((d: any) => number)) => GlobeMethods
  pointColor: (accessor: string | ((d: any) => string)) => GlobeMethods
  pointLabel: (accessor: string | ((d: any) => string)) => GlobeMethods
  pointsMerge: (val: boolean) => GlobeMethods
  arcsData: (data: any[]) => GlobeMethods
  arcColor: (accessor: string | ((d: any) => string | string[])) => GlobeMethods
  arcStroke: (accessor: string | number | ((d: any) => number)) => GlobeMethods
  arcDashLength: (val: number) => GlobeMethods
  arcDashGap: (val: number) => GlobeMethods
  arcDashAnimateTime: (val: number) => GlobeMethods
  arcAltitude: (accessor: string | number | ((d: any) => number)) => GlobeMethods
  arcAltitudeAutoScale: (val: number) => GlobeMethods
  htmlLabels: (val: boolean) => GlobeMethods
  showAtmosphere: (val: boolean) => GlobeMethods
  atmosphereColor: (val: string) => GlobeMethods
  atmosphereAltitude: (val: number) => GlobeMethods
  width: (val: number) => GlobeMethods
  height: (val: number) => GlobeMethods
  onPointClick: (cb: (point: any, event: MouseEvent) => void) => GlobeMethods
  onPointHover: (cb: (point: any | null, prevPoint: any | null) => void) => GlobeMethods
  _destructor: () => void
  [key: string]: any
}

interface GlobeProps {
  width?: number
  height?: number
  globeImageUrl?: string
  backgroundImageUrl?: string
  pointsData?: any[]
  pointLat?: string | ((d: any) => number)
  pointLng?: string | ((d: any) => number)
  pointAltitude?: string | number | ((d: any) => number)
  pointRadius?: string | number | ((d: any) => number)
  pointColor?: string | ((d: any) => string)
  pointLabel?: string | ((d: any) => string)
  pointsMerge?: boolean
  arcsData?: any[]
  arcColor?: string | ((d: any) => string | string[])
  arcStroke?: string | number | ((d: any) => number)
  arcDashLength?: number
  arcDashGap?: number
  arcDashAnimateTime?: number
  arcAltitude?: string | number | ((d: any) => number)
  arcAltitudeAutoScale?: number
  htmlLabels?: boolean
  showAtmosphere?: boolean
  atmosphereColor?: string
  atmosphereAltitude?: number
  onPointClick?: (point: any, event: MouseEvent) => void
  onPointHover?: (point: any | null, prevPoint: any | null) => void
  globeRef?: MutableRefObject<GlobeMethods | undefined>
  ref?: MutableRefObject<GlobeMethods | undefined>
  autoRotate?: boolean
  autoRotateSpeed?: number
  enablePointerInteraction?: boolean
  [key: string]: any
}

declare function Globe(): (container: HTMLElement) => GlobeMethods
declare function Globe(props: GlobeProps): ReactElement | null
declare namespace Globe {
  export type { GlobeMethods, GlobeProps }
}

export default Globe
export type { GlobeMethods, GlobeProps }
