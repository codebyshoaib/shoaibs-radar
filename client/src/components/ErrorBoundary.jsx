import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error:', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center flex-1 bg-gray-900 text-red-400 p-8 gap-4">
          <div className="text-lg font-semibold">Something went wrong</div>
          <pre className="text-sm text-red-300 bg-gray-800 rounded p-4 max-w-xl w-full overflow-auto whitespace-pre-wrap">
            {this.state.error?.message ?? 'Unknown error'}
          </pre>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
