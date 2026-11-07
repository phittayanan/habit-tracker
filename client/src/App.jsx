import React, { useEffect, useRef, useState } from 'react';
import { api } from './api.js';
import { TemplateForm, TemplateList } from './templates.jsx';

const firstPage = user => user.role === 'MANAGER' ? '/templates' : '/goals';

export function App({ extraPage }) {
  const [path, setPath] = useState(location.pathname);
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const pending = useRef(false);

  function navigate(next, replace = false) {
    if (location.pathname !== next) history[replace ? 'replaceState' : 'pushState']({}, '', next);
    setPath(next);
  }
  function unauthenticated() {
    setUser(null);
    setPassword('');
    navigate('/login', true);
  }
  useEffect(() => {
    let active = true;
    async function check() {
      try {
        const result = await api('/api/auth/me', {}, () => { if (active) unauthenticated(); });
        if (active) {
          setUser(result.user);
          if (location.pathname === '/login' || location.pathname === '/') navigate(firstPage(result.user), true);
        }
      } catch (error) { if (active && location.pathname !== '/login') setMessage(error.message); }
      finally { if (active) setChecking(false); }
    }
    check();
    const pop = () => { setPath(location.pathname); setMessage(''); check(); };
    window.addEventListener('popstate', pop);
    return () => { active = false; window.removeEventListener('popstate', pop); };
  }, []);

  async function login(event) {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true;
    setBusy(true); setMessage('');
    try {
      const result = await api('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }),
      }, unauthenticated);
      setUser(result.user); setPassword(''); navigate(firstPage(result.user));
    } catch (error) { setMessage(error.message); setPassword(''); }
    finally { pending.current = false; setBusy(false); }
  }
  async function logout() {
    if (pending.current) return;
    pending.current = true; setBusy(true); setMessage('');
    try { await api('/api/auth/logout', { method: 'POST' }, unauthenticated); unauthenticated(); }
    catch (error) { setMessage(error.message); }
    finally { pending.current = false; setBusy(false); }
  }
  async function follow(event, next) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setMessage('');
    try {
      const result = await api('/api/auth/me', {}, unauthenticated);
      setUser(result.user); navigate(next);
    } catch (error) { setMessage(error.message); }
  }

  if (checking) return <main className="shell"><p role="status">Loading…</p></main>;
  if (!user || path === '/login') return <main className="login">
    <form onSubmit={login} noValidate>
      <h1>Log in</h1>
      {message && <p role="alert" className="error">{message}</p>}
      <label>Username<input name="username" autoComplete="username" value={username} onChange={event => setUsername(event.target.value)} /></label>
      <label>Password<input name="password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} /></label>
      <button type="submit" disabled={busy}>Log in</button>
      <div className="loading" role="status">{busy ? 'Logging in…' : ''}</div>
    </form>
  </main>;

  const menu = user.role === 'MANAGER' ? ['Templates'] : ['Goals', 'Templates'];
  const wrongRole = (user.role === 'PARTICIPANT' && /^\/templates\/(new|[^/]+\/edit)\/?$/.test(path)) ||
    (user.role === 'MANAGER' && path === '/goals');
  let page = extraPage?.(path);
  if (wrongRole) page = <p>This page is not available for your role.</p>;
  else if (path === '/templates') page = <TemplateList user={user} navigate={navigate} onUnauthenticated={unauthenticated} />;
  else if (path === '/templates/new') page = <TemplateForm navigate={navigate} onUnauthenticated={unauthenticated} />;
  else if (path === '/goals') page = <h1>Goals</h1>;
  return <>
    <header className="topbar">
      <div className="identity">{user.displayName}</div>
      <nav aria-label="Role menu">{menu.map(label => {
        const next = `/${label.toLowerCase()}`;
        return <a key={label} href={next} aria-current={path === next ? 'page' : undefined} onClick={event => follow(event, next)}>{label}</a>;
      })}</nav>
      <button type="button" onClick={logout} disabled={busy}>Log out</button>
    </header>
    <main className="shell">
      {message && <p role="alert" className="error">{message}</p>}
      {page}
    </main>
  </>;
}
