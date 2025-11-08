'use client'

import * as React from 'react'

type Props = {
  children: React.ReactNode
}

export function ThemeProvider({ children }: Props) {
  return <>{children}</>
}
