"use client"

import { Component, type ReactNode } from "react"

interface Props {
  children: ReactNode
  sectionKey: string
}

interface State {
  hasError: boolean
}

export class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error(`Section "${this.props.sectionKey}" crashed:`, error)
  }

  render() {
    if (this.state.hasError) {
      return null
    }
    return this.props.children
  }
}
