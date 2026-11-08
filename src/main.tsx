import React, { Component, type ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import './styles/index.css';

class AppBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main className="startup">
          <h1>잠시 쉬었다 다시 만나요</h1>
          <p>화면을 불러오지 못했어요. 저장된 기록은 삭제하지 않았어요.</p>
          <button className="primary" onClick={() => location.reload()}>
            다시 열기
          </button>
        </main>
      );
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppBoundary>
      <a className="skip-link" href="#main-content">본문으로 바로 가기</a>
      <App />
    </AppBoundary>
  </React.StrictMode>,
);
