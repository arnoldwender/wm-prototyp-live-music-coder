/* Smoke test — verifies App renders the Landing page at root */
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the landing page heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})
