import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

/**
 * Color variables from requirements
 *  primary:   #1976d2 (main blue)
 *  secondary: #424242 (dark grey)
 *  accent:    #ff9800 (orange)
 */

/* API base URL - adjust as needed per deploy environment */
const API_BASE = 'https://vscode-internal-018-beta.beta01.cloud.kavia.ai:3001';

/************************************************************/
/*                  HELPER UI COMPONENTS                    */
/************************************************************/

// PUBLIC_INTERFACE
function Header({ user, onLogout }) {
  /** Application header with user controls. */
  return (
    <header style={{
      background: 'var(--bg-secondary, #f8f9fa)', color: 'var(--text-primary, #282c34)',
      padding: '18px 40px 18px 16px', fontWeight: 700, display: 'flex',
      alignItems: 'center', justifyContent: 'space-between',
      borderBottom: '2px solid #e9ecef'
    }}>
      <div style={{ fontSize: 26, color: '#1976d2', letterSpacing: 1, fontWeight: 700 }}>
        <span role="img" aria-label="tic-tac-toe-icon" style={{marginRight: 8}}>🎮</span>
        Tic Tac Track
      </div>
      <div>
        {user
          ? <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ color: "#424242", fontWeight: 500, fontSize: 16 }}>Logged in as <span style={{color: "#ff9800"}}>{user.username}</span></span>
              <button onClick={onLogout} className="btn btn-small" style={{ background: "#ff9800", color: "#fff" }}>Logout</button>
            </div>
          : null
        }
      </div>
    </header>
  );
}

// PUBLIC_INTERFACE
function LoginRegister({ onAuth }) {
  /** Simple login/register form (username/password) */
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');
  const [err, setErr] = useState('');

  // PUBLIC_INTERFACE
  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    try {
      const resp = await fetch(`${API_BASE}/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!resp.ok) {
        const { detail } = await resp.json();
        setErr(detail || 'Login/Register error');
        return;
      }
      const data = await resp.json();
      // save token; pass user info up
      localStorage.setItem('ttt_token', data.access_token);
      onAuth({ username, token: data.access_token });
    } catch (e) {
      setErr('Network error');
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh'
    }}>
      <div style={{
        background: '#fff', padding: 32, borderRadius: 8, boxShadow: '0 2px 14px #0001',
        maxWidth: 320, width: '90%'
      }}>
        <h2 style={{ color: "#1976d2", marginBottom: 8 }}>
          {mode === 'login' ? 'Sign In' : 'Register'}
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="text"
            value={username}
            required
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            style={{
              padding: 10,
              border: "1px solid #e9ecef",
              borderRadius: 5,
              fontSize: 16
            }}
            autoFocus
          />
          <input
            type="password"
            value={password}
            required
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            style={{ padding: 10, border: "1px solid #e9ecef", borderRadius: 5, fontSize: 16 }}
          />
          <button type="submit" className="btn" style={{
            background: "#1976d2", color: "white", fontWeight: 600, marginTop: 2, fontSize: 15
          }}>
            {mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
        <div style={{textAlign:"center", marginTop: 14}}>
          <button
            className="btn btn-text"
            type="button"
            style={{
              background: "none", color: "#424242", fontSize: 14, border: "none",
              textDecoration: "underline", cursor: "pointer", margin: "0"
            }}
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErr(''); }}>
            {mode === 'login'
              ? "Don't have an account? Register"
              : "Already registered? Login"}
          </button>
        </div>
        {err && <div style={{ color: "#ff9800", marginTop: 10, fontSize: 15 }}>{err}</div>}
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function GameListSidebar({ games, onSelect, onCreate, selectedGameId, loading }) {
  /** Sidebar: lists open/games, button to create, selectable */
  return (
    <aside style={{
      width: 260, background: "#f8f9fa", borderRight: "1.5px solid #e9ecef",
      padding: "20px 5px 20px 18px", height: "calc(100vh - 72px)", boxSizing: "border-box", overflowY: "auto"
    }}>
      <h3 style={{ color: "#1976d2", fontSize: 20, marginBottom: 16 }}>
        My Games
        <button onClick={onCreate} className="btn" style={{
          marginLeft: 10, background: "#ff9800", color: "#fff", fontSize: 14, padding: "3px 12px"
        }}>+ New Game</button>
      </h3>
      {loading && <div style={{ color: "#1976d2", fontWeight: 500 }}>Loading…</div>}
      {!loading && !games.length && (
        <div style={{ color: "#424242", opacity: 0.85, marginTop: 24 }}>No games yet.<br />
          Click <span style={{ color: "#ff9800" }}>+ New Game</span> to begin.</div>
      )}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {!loading && games.map(game =>
          <li key={game.id}>
            <button onClick={() => onSelect(game)}
              className="btn"
              style={{
                background: game.id === selectedGameId ? "#e1eefa" : "#fff",
                color: "#1976d2",
                border: "1px solid #1976d2",
                margin: "8px 0", borderRadius: 6, padding: "9px 8px", fontWeight: 600,
                width: "90%", textAlign: "left", fontSize: 15, cursor: "pointer"
              }}>
              ➜ Game {game.id.slice(-6)}&nbsp;&nbsp;{game.status === "completed" ? "🏁" : ""}
              <span style={{ float: "right", color: "#424242", fontWeight: 400, fontSize: "90%" }}>
                {game.status === "active" ? "live" : game.status}
              </span>
            </button>
          </li>
        )}
      </ul>
    </aside>
  );
}

// PUBLIC_INTERFACE
function MoveHistory({ moves }) {
  /** Show move history for a game */
  return (
    <div style={{ minWidth: 170, padding: "20px", height: "100%", background: "#fafbfc", borderLeft: "1px solid #e9ecef" }}>
      <h4 style={{ color: "#1976d2", fontSize: 19, marginBottom: 10 }}>Move History</h4>
      {!moves.length && <div style={{ color: "#424242", fontSize: 14 }}>No moves yet.</div>}
      <ol style={{ paddingLeft: 15, fontSize: 15 }}>
        {moves.map((mv, i) =>
          <li key={i} style={{ margin: "6px 0", color: mv.player === "X" ? "#1976d2" : "#ff9800" }}>
            <b>{mv.player}</b> ➔ ({mv.row + 1}, {mv.col + 1})
          </li>
        )}
      </ol>
    </div>
  );
}

// PUBLIC_INTERFACE
function GameBoard({ board, onMove, currentTurn, myMark, gameStatus, disabled }) {
  /** Main game board */
  // Helper: What to show for each box
  function cellValue(val) {
    if (val === 'X') return <span style={{ color: "#1976d2", fontWeight: 700 }}>X</span>;
    if (val === 'O') return <span style={{ color: "#ff9800", fontWeight: 700 }}>O</span>;
    return '';
  }
  // PUBLIC_INTERFACE
  function handleClick(rowIdx, colIdx) {
    if (!disabled && !board[rowIdx][colIdx]) onMove(rowIdx, colIdx);
  }
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 70px)',
      gridTemplateRows: 'repeat(3, 70px)',
      gap: 7,
      margin: '20px auto'
    }}>
      {board.map((row, r) =>
        row.map((cell, c) => (
          <div
            key={r + "-" + c}
            onClick={() => handleClick(r, c)}
            style={{
              width: 70,
              height: 70,
              background: "#fff",
              border: "2px solid #1976d2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 33,
              fontWeight: 700,
              cursor: !cell && !disabled && currentTurn === myMark && gameStatus === "active" ? "pointer" : "not-allowed",
              borderRadius: 10,
              transition: "background 0.2s",
              userSelect: "none"
            }}
          >
            {cellValue(cell)}
          </div>
        ))
      )}
    </div>
  );
}

// PUBLIC_INTERFACE
function GameResult({ result, onPlayAgain }) {
  /** Display game result and action */
  let msg = "-";
  if (result?.winner === "draw") msg = "It's a Draw!";
  else if (result?.winner) msg = `Winner: ${result.winner}`;
  else msg = "";

  return (
    <div style={{
      textAlign: "center",
      fontSize: 20, margin: "18px 0 10px 0",
      background: "#f2f2f7",
      borderRadius: 8, padding: "9px 0",
      color: "#1976d2"
    }}>
      <span>
        {msg}
      </span>
      {result?.winner &&
        <button
          className="btn"
          style={{ background: "#ff9800", color: "#fff", marginLeft: 24, fontWeight: 600, fontSize: 16 }}
          onClick={onPlayAgain}
        >Play Again</button>
      }
    </div>
  );
}

/************************************************************/
/*                  MAIN APP COMPONENT                      */
/************************************************************/
function App() {
  /* THEME handling (already present), add theme to body root */
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  /************************************************************/

  /* ---- USER: authentication state ---- */
  const [user, setUser] = useState(null);

  // Boot: Check for existing token
  useEffect(() => {
    const tok = localStorage.getItem('ttt_token');
    if (tok) {
      // Optionally try to GET /me with token to validate?
      setUser({ username: "User", token: tok }); // Later, real username (unless backend returns it on /me)
      // Optionally fetch from backend
      fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${tok}` }
      }).then(r => r.ok && r.json())
        .then(data => { if (data?.username) setUser({ username: data.username, token: tok }); });
    }
  }, []);

  // On logout
  function handleLogout() {
    localStorage.removeItem('ttt_token');
    setUser(null);
    setSelectedGame(null);
  }

  /* ---- GAME LIST: all games for this user ---- */
  const [games, setGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(false);

  // Fetch games function
  const fetchGames = useCallback(() => {
    if (!user) return;
    setGamesLoading(true);
    fetch(`${API_BASE}/games`, { headers: { Authorization: `Bearer ${user.token}` } })
      .then(resp => resp.json())
      .then(arr => setGames(arr))
      .finally(() => setGamesLoading(false));
  }, [user]);

  useEffect(() => { if (user) fetchGames(); }, [user, fetchGames]);

  // CREATE game
  function handleCreateGame() {
    if (!user) return;
    fetch(`${API_BASE}/games`, {
      method: "POST", headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(resp => resp.json())
      .then(newGame => {
        fetchGames();
        setSelectedGame(newGame);
      });
  }

  // ON picking game from sidebar
  const [selectedGame, setSelectedGame] = useState(null);

  function handleSelectGame(game) {
    setSelectedGame(game);
  }

  /* ---- GAME BOARD: details for selected game ---- */
  const [gameDetails, setGameDetails] = useState(null);
  const [boardLoading, setBoardLoading] = useState(false);

  // To poll selected game for updates
  useEffect(() => {
    if (!selectedGame || !user) {
      setGameDetails(null);
      return;
    }

    let live = true;
    setBoardLoading(true);

    async function pollGame() {
      if (!selectedGame?.id || !user?.token) return;
      const resp = await fetch(`${API_BASE}/games/${selectedGame.id}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      if (resp.ok) {
        const g = await resp.json();
        if (live) setGameDetails(g);
        // If game is still ongoing, poll again in 2.8s, else stop
        if (live && g.status === "active") setTimeout(pollGame, 2800);
      }
      setBoardLoading(false);
    }
    pollGame();

    return () => { live = false; };
  }, [selectedGame, user]);

  // On successful move, re-fetch current game
  const refreshSelectedGame = useCallback(() => {
    if (selectedGame && user) {
      fetch(`${API_BASE}/games/${selectedGame.id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
        .then(resp => resp.json())
        .then(dt => setGameDetails(dt));
    }
  }, [selectedGame, user]);

  // JOIN game (if not in and not completed)
  function handleJoinGame() {
    if (!user || !gameDetails?.id) return;
    fetch(`${API_BASE}/games/${gameDetails.id}/join`, {
      method: "POST",
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(resp => resp.json())
      .then(dt => {
        setGameDetails(dt);
        refreshSelectedGame();
      });
  }

  // MAKE move
  function handleMove(r, c) {
    if (!user || !gameDetails?.id || !gameDetails.is_my_turn) return;
    fetch(`${API_BASE}/games/${gameDetails.id}/move`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${user.token}`,
        'Content-Type': "application/json"
      },
      body: JSON.stringify({ row: r, col: c })
    }).then(resp => resp.json())
      .then(dt => {
        setGameDetails(dt);
        refreshSelectedGame();
      });
  }

  // PLAY AGAIN (rematch/new game with same player)
  function handlePlayAgain() {
    handleCreateGame();
  }

  /************************************************************/
  /*   UI LAYOUT: full grid: sidebar | board-center | moves   */
  /************************************************************/

  return (
    <div className="App" style={{ minHeight: "100vh", background: "#f8f9fc" }}>
      {/* HEADER */}
      <Header user={user} onLogout={handleLogout} />
      {/* Theme toggle*/}
      <button className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        style={{ position: "fixed", top: 15, right: 20, zIndex: 22 }}>
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>

      {!user ?
        <LoginRegister onAuth={setUser} />
        :
        <div style={{
          display: "flex", flexDirection: "row", minHeight: "calc(100vh - 72px)",
          alignItems: "stretch", marginTop: 0
        }}>
          {/* SIDEBAR: Game list */}
          <GameListSidebar
            games={games}
            onSelect={handleSelectGame}
            onCreate={handleCreateGame}
            selectedGameId={selectedGame?.id}
            loading={gamesLoading}
          />

          {/* MAIN BOARD */}
          <div style={{
            flex: 1,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start",
            background: "#fff", minHeight: "calc(100vh - 72px)",
            padding: "20px 0 30px 0"
          }}>
            {!selectedGame ?
              <div style={{ color: "#1976d2", fontSize: 28, marginTop: 48, fontWeight: 600 }}>
                Select a game or create a new one!
              </div>
              : boardLoading || !gameDetails ?
                <div style={{ color: "#1976d2", fontSize: 20, marginTop: 80 }}>Loading board…</div>
                : (
                  <>
                    <div style={{
                      color: "#424242",
                      fontSize: 18,
                      marginBottom: 2,
                      fontWeight: 600,
                    }}>
                      Game <span style={{ color: "#1976d2" }}>#{gameDetails.id?.slice(-6) || '?'}</span>
                      {gameDetails.status === "completed" && <span style={{ color: "#ff9800", marginLeft: 18 }}>🏁 Finished</span>}
                      {gameDetails.status === "active" && <span style={{ color: "#1976d2", marginLeft: 18 }}>Active</span>}
                    </div>
                    <div style={{ fontSize: 15, color: "#1976d2", marginBottom: 7 }}>
                      Players:
                      <span style={{ margin: "0 5px", color: "#1976d2" }}>{gameDetails.player_x || "?"}</span> (X)
                      {gameDetails.player_o ? (
                        <>
                          {" "}vs{" "}
                          <span style={{ color: "#ff9800" }}>{gameDetails.player_o}</span> (O)
                        </>
                      ) :
                        <span style={{ color: "#ff9800", marginLeft: 12 }}>Waiting for O…</span>
                      }
                    </div>
                    {(!gameDetails.you_are && gameDetails.status !== "completed") &&
                      <button className="btn" style={{
                        background: "#1976d2",
                        color: "#fff", marginBottom: 10,
                        fontSize: 16, fontWeight: 600
                      }} onClick={handleJoinGame}>Join Game</button>}
                    {/* BOARD */}
                    <GameBoard
                      board={gameDetails.board}
                      onMove={handleMove}
                      currentTurn={gameDetails.current_turn}
                      myMark={gameDetails.you_are}
                      gameStatus={gameDetails.status}
                      disabled={gameDetails.status !== "active" || !gameDetails.is_my_turn}
                    />
                    {/* WHOSE TURN */}
                    {(gameDetails.status === "active") &&
                      <div style={{ color: "#1976d2", fontWeight: 500, fontSize: 16, marginTop: -6 }}>
                        {gameDetails.is_my_turn
                          ? (<span>Your turn <strong>({gameDetails.you_are})</strong></span>)
                          : <span>Waiting for: <strong>{gameDetails.current_turn}</strong></span>}
                      </div>
                    }
                    {/* RESULT */}
                    {gameDetails.status === "completed" &&
                      <GameResult
                        result={{
                          winner: gameDetails.winner,
                        }}
                        onPlayAgain={handlePlayAgain}
                      />
                    }
                  </>
                )}
          </div>

          {/* Move History */}
          <MoveHistory moves={gameDetails?.moves || []} />
        </div>
      }
    </div>
  );
}

export default App;
