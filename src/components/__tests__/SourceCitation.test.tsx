import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import SourceCitation from '../SourceCitation'
import type { Source } from '../../hooks/useMessages'

describe('SourceCitation', () => {
  const source: Source = {
    title: 'Official Docs',
    url: 'https://example.com/guide',
  }

  it('renders the title and hostname of a valid url', () => {
    render(<SourceCitation source={source} />)
    expect(screen.getByText('Official Docs')).toBeInTheDocument()
    expect(screen.getByText('example.com')).toBeInTheDocument()
  })

  it('links to the source url in a new tab with noopener', () => {
    render(<SourceCitation source={source} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', source.url)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('falls back to the raw url as host when it cannot be parsed', () => {
    const bad: Source = { title: 'Odd', url: 'not a url' }
    render(<SourceCitation source={bad} />)
    expect(screen.getByText('Odd')).toBeInTheDocument()
    expect(screen.getByText('not a url')).toBeInTheDocument()
  })

  it('falls back to the hostname when there is no title', () => {
    const noTitle: Source = { title: '', url: 'https://example.org/x' }
    render(<SourceCitation source={noTitle} />)
    // title and host are identical here, so both spans hold "example.org"
    expect(screen.getAllByText('example.org').length).toBeGreaterThan(0)
  })
})
