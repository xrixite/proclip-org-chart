import { Component, ErrorInfo, ReactNode } from 'react';
import { MessageBar, MessageBarBody, Button, makeStyles, tokens } from '@fluentui/react-components';
import { ErrorCircle24Regular } from '@fluentui/react-icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '40px 20px',
    gap: '20px',
  },
  errorIcon: {
    fontSize: '64px',
    color: tokens.colorPaletteRedForeground1,
  },
  title: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    textAlign: 'center',
  },
  message: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground2,
    textAlign: 'center',
    maxWidth: '600px',
  },
  details: {
    marginTop: '20px',
    padding: '16px',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    maxWidth: '800px',
    maxHeight: '200px',
    overflow: 'auto',
    fontFamily: 'monospace',
    fontSize: tokens.fontSizeBase200,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
});

function ErrorFallback({ error, errorInfo, onReset }: { error: Error; errorInfo: ErrorInfo; onReset: () => void }) {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <ErrorCircle24Regular className={styles.errorIcon} />
      <div className={styles.title}>Something went wrong</div>
      <div className={styles.message}>
        We encountered an unexpected error while displaying this content.
        Try refreshing the page or contact your administrator if the problem persists.
      </div>

      <MessageBar intent="error">
        <MessageBarBody>
          <strong>Error:</strong> {error.message}
        </MessageBarBody>
      </MessageBar>

      <div style={{ display: 'flex', gap: '12px' }}>
        <Button appearance="primary" onClick={onReset}>
          Try Again
        </Button>
        <Button appearance="secondary" onClick={() => window.location.reload()}>
          Reload Page
        </Button>
      </div>

      {import.meta.env.DEV && (
        <details className={styles.details}>
          <summary style={{ cursor: 'pointer', marginBottom: '8px', fontWeight: 'bold' }}>
            Error Details (Development Only)
          </summary>
          <div>
            <strong>Stack Trace:</strong>
            <pre>{error.stack}</pre>
          </div>
          <div style={{ marginTop: '16px' }}>
            <strong>Component Stack:</strong>
            <pre>{errorInfo.componentStack}</pre>
          </div>
        </details>
      )}
    </div>
  );
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
