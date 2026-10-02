import React from 'react';
import { ErrorState } from './AsyncState';

export class SectionErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('Ошибка блока интерфейса', error, info); }
  render() {
    if (this.state.error) return <ErrorState compact message="Этот блок временно недоступен." onRetry={() => this.setState({ error: null })} />;
    return this.props.children;
  }
}
