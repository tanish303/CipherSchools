import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const AssignmentAttempt = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState(null);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [hint, setHint] = useState('');
    const [loadingHint, setLoadingHint] = useState(false);
    const [executing, setExecuting] = useState(false);
    const [attempts, setAttempts] = useState([]);

    useEffect(() => {
        // Auth gate
        const user = localStorage.getItem('user');
        if (!user) {
            navigate('/');
            return;
        }

        const fetchAssignment = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/assignments/${id}`);
                setAssignment(res.data);
            } catch (err) {
                console.error("Hint generation error:", err);
                console.error(err);
                setErrorMsg("Failed to load assignment data.");
            }
        };

        const fetchPastAttempts = async () => {
            const parsedUser = JSON.parse(user);
            if (parsedUser && !parsedUser.isGuest) {
                try {
                    const res = await axios.get(`http://localhost:5000/api/attempts/${id}/${parsedUser.userId}`);
                    setAttempts(res.data);
                } catch (e) {
                    console.error("Failed to fetch past attempts", e);
                }
            }
        };

        fetchAssignment();
        fetchPastAttempts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, navigate]);

    const handleExecute = async () => {
        setExecuting(true);
        setErrorMsg(null);
        setResults(null);
        setHint('');

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const res = await axios.post('http://localhost:5000/api/execute', { 
                query,
                assignmentId: id,
                userId: user?.userId
            });
            setResults(res.data);

            // Refresh attempts list after evaluating query
            if (user && !user.isGuest) {
                try {
                    const attemptsRes = await axios.get(`http://localhost:5000/api/attempts/${id}/${user.userId}`);
                    setAttempts(attemptsRes.data);
                } catch (e) {
                    console.error("Failed to fetch past attempts silently:", e);
                }
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.error || "Execution failed.");
            // ALSO refresh attempts even if syntax execution failed
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && !user.isGuest) {
                 try {
                     const attemptsRes = await axios.get(`http://localhost:5000/api/attempts/${id}/${user.userId}`);
                     setAttempts(attemptsRes.data);
                 } catch (e) {
                     console.error("Silent failed to fetch attempts:", e);
                 }
            }
        } finally {
            setExecuting(false);
        }
    };

    const handleGetHint = async () => {
        if (!query.trim()) {
            setErrorMsg("Please write some SQL first before asking for a hint.");
            return;
        }

        setLoadingHint(true);
        try {
            const res = await axios.post('http://localhost:5000/api/hints', {
                assignmentId: id,
                userQuery: query
            });
            setHint(res.data.hint);
        } catch (err) {
            console.error("Failed to generate hint:", err);
            setErrorMsg("Failed to generate hint.");
        } finally {
            setLoadingHint(false);
        }
    };

    if (!assignment) return <div className="loader">Loading workspace...</div>;

    return (
        <div className="workspace">
            {/* Left Panel: Assignment Details & Schema */}
            <div className="workspace__left">
                <button className="btn--primary btn--back" onClick={() => navigate('/assignments')}>
                    &larr; Back to Listings
                </button>
                
                <div className="workspace__panel">
                    <div className="workspace__panel-header">
                        <h3>Problem Statement</h3>
                        <span className={`assignment-card__diff assignment-card__diff--${assignment.difficulty.toLowerCase()}`}>
                            {assignment.difficulty}
                        </span>
                    </div>
                    <div className="workspace__panel-content" style={{padding: '0 5px'}}>
                        <h4 style={{marginBottom: '10px'}}>{assignment.title}</h4>
                        <p>{assignment.description}</p>
                        
                        <h4 style={{marginTop: '20px', marginBottom: '10px', color: '#fff'}}>Available Tables</h4>
                        {assignment.expectedTables?.map((tbl, idx) => (
                            <div key={idx} style={{marginBottom: '15px', padding: '15px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)'}}>
                                <strong style={{color: '#8b5cf6', fontSize: '1.1rem'}}>{tbl.tableName}</strong>
                                <p style={{fontSize: '0.85rem', color: '#cbd5e1', margin: '5px 0'}}>{tbl.schemaDescription}</p>
                                {/* We can render standard table here just for visual sample if they have sample data */}
                                {tbl.sampleData && tbl.sampleData.length > 0 && (
                                   <table className="results-table" style={{marginTop: '10px'}}>
                                       <thead>
                                           <tr>
                                               {Object.keys(tbl.sampleData[0]).map(k => <th key={k}>{k}</th>)}
                                           </tr>
                                       </thead>
                                       <tbody>
                                           {tbl.sampleData.map((row, i) => (
                                               <tr key={i}>
                                                   {Object.values(row).map((val, cellIdx) => <td key={cellIdx}>{val}</td>)}
                                               </tr>
                                           ))}
                                       </tbody>
                                   </table>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel: Editor & Results */}
            <div className="workspace__right">
                <div className="workspace__panel">
                    <div className="workspace__panel-header">
                        <h3>SQL Editor</h3>
                        <div style={{display: 'flex', gap: '10px'}}>
                            <button 
                                className="btn--accent" 
                                onClick={handleGetHint} 
                                disabled={loadingHint || executing}
                            >
                                {loadingHint ? "Thinking..." : "Get Hint"}
                            </button>
                            <button 
                                className="btn--success" 
                                onClick={handleExecute} 
                                disabled={executing || !query.trim()}
                            >
                                {executing ? "Executing..." : "Run Query"}
                            </button>
                        </div>
                    </div>
                    
                    <div className="workspace__panel-content workspace__panel-content--editor">
                        <Editor
                            height="100%"
                            defaultLanguage="sql"
                            value={query}
                            onChange={(val) => setQuery(val)}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                wordWrap: 'on'
                            }}
                        />
                    </div>
                </div>

                {/* Output Panel */}
                <div className="workspace__panel" style={{flex: 0.8}}>
                    <div className="workspace__panel-header">
                        <h3>Execution Results</h3>
                    </div>
                    <div className="workspace__panel-content">
                        {errorMsg && <div className="error-msg">{errorMsg}</div>}
                        {hint && <div className="hint-box">💡 <strong>AI Hint:</strong> <br/>{hint}</div>}
                        
                        {results && (
                           <div style={{marginTop: '10px'}}>
                                {results.isCorrect !== undefined && (
                                    <div style={{
                                        padding: '10px', 
                                        borderRadius: '4px', 
                                        marginBottom: '10px',
                                        backgroundColor: results.isCorrect ? '#e8f8f5' : '#fdedec',
                                        borderLeft: `4px solid ${results.isCorrect ? '#2ecc71' : '#e74c3c'}`,
                                        color: results.isCorrect ? '#1e8449' : '#c0392b'
                                    }}>
                                        <strong>{results.isCorrect ? '✅ Correct!' : '❌ Incorrect Data.'}</strong>
                                        {results.isCorrect 
                                            ? ' Your query returns the exact expected results.'
                                            : ' Your query executed successfully, but the resulting data does not match the expected answer. Keep trying!'}
                                    </div>
                                )}
                                <p style={{marginBottom: '10px', fontSize: '0.9rem', color: '#2ecc71'}}>
                                    Query Executed Successfully! Rows returned: {results.rowCount}
                                </p>
                               <div style={{overflowX: 'auto'}}>
                                   <table className="results-table">
                                       <thead>
                                           <tr>
                                               {results.columns?.map(col => <th key={col}>{col}</th>)}
                                           </tr>
                                       </thead>
                                       <tbody>
                                           {results.rows?.map((row, idx) => (
                                               <tr key={idx}>
                                                   {results.columns.map(col => <td key={col}>{row[col]}</td>)}
                                               </tr>
                                           ))}
                                       </tbody>
                                   </table>
                               </div>
                           </div>
                        )}

                        {!errorMsg && !results && !hint && (
                            <p style={{color: '#7f8c8d', fontStyle: 'italic', textAlign: 'center', marginTop: '20px'}}>
                                Run a query to see results or get a hint.
                            </p>
                        )}
                    </div>
                </div>

                {/* Previous Attempts Panel */}
                <div className="workspace__panel" style={{flex: 0.5, marginTop: '10px'}}>
                    <div className="workspace__panel-header">
                        <h3>Your Query History</h3>
                    </div>
                    <div className="workspace__panel-content" style={{padding: '15px'}}>
                        {(!attempts || attempts.length === 0) ? (
                            <p style={{color: '#94a3b8', fontStyle: 'italic', textAlign: 'center'}}>
                                No past attempts recorded yet. Run a query to start tracking!
                            </p>
                        ) : (
                            attempts.map(att => (
                                <div key={att._id} style={{padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                                    <div style={{display: 'flex', alignItems: 'center', marginBottom: '5px'}}>
                                        <span style={{color: att.isCorrect ? '#10b981' : '#ef4444', marginRight: '8px', fontSize: '1.2rem'}}>{att.isCorrect ? '✅' : '❌'}</span>
                                        <code style={{color: '#94a3b8', fontFamily: 'monospace', flex: 1}}>{att.query}</code>
                                    </div>
                                    <div style={{fontSize: '0.75rem', color: '#64748b', marginLeft: '30px'}}>
                                        {new Date(att.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignmentAttempt;
