import { Fragment, useEffect, useState } from "react";
import "../style/list.css";
import { Link } from "react-router-dom";

export default function List() {
    const [taskData, setTaskData] = useState([]);
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;

        const fetchTasks = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/tasks`, {
                    credentials: "include",
                });
                const data = await response.json();

                if (isMounted) {
                    if (data.success) {
                        setTaskData(data.result);
                    } else {
                        setError(data.message || "Could not load tasks.");
                    }
                }
            } catch {
                if (isMounted) {
                    setError("Cannot connect to server. Is the backend running?");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchTasks();

        // Cleanup to prevent state updates on unmounted component
        return () => {
            isMounted = false;
        };
    }, []);

    // Toggle task between active and completed
    const toggleStatus = async (id, currentStatus) => {
        try {
            const nextStatus = currentStatus === "completed" ? "active" : "completed";
            const response = await fetch(`${import.meta.env.VITE_API_URL}/update-task/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ _id: id, status: nextStatus }),
                credentials: "include"
            });
            const result = await response.json();
            if (result.success) {
                setTaskData(prev => prev.map(t => t._id === id ? { ...t, status: nextStatus } : t));
            }
        } catch {
            alert("Status update failed. Please try again.");
        }
    };

    // Delete a single task after confirmation
    const deleteTask = async (id) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/delete/${id}`, {
                method: "DELETE",
                credentials: "include"
            });
            const result = await response.json();
            if (result.success) {
                setTaskData(prev => prev.filter(t => t._id !== id));
            }
        } catch {
            alert("Delete failed. Please try again.");
        }
    };

    // Format ISO date string to readable format
    const formatDate = (dateString) => {
        if (!dateString) return "No date set";
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Apply search and filter together
    const filteredTasks = taskData.filter(item => {
        if (filter === "active" && item.status !== "active") return false;
        if (filter === "completed" && item.status !== "completed") return false;
        return item.title.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Live count of active vs completed tasks
    const activeCount = taskData.filter(t => t.status === "active").length;
    const completedCount = taskData.filter(t => t.status === "completed").length;

    return (
        <div className="list-container">
            <div className="list-toolbar">
                <h1>Your Tasks</h1>
            </div>

            {/* Search bar */}
            <div style={{ marginBottom: '1.5rem' }}>
                <input
                    type="text"
                    placeholder="🔍 Search tasks by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid var(--clr-border)',
                        fontSize: '0.95rem',
                        backgroundColor: 'var(--clr-surface)',
                        color: 'var(--clr-text-primary)'
                    }}
                />
            </div>

            {/* Task count summary */}
            <div style={{ marginBottom: '1.25rem', fontSize: '0.95rem', color: 'var(--clr-text-secondary)' }}>
                📊 <strong>Active:</strong> {activeCount} &nbsp;|&nbsp; <strong>Completed:</strong> {completedCount}
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <button onClick={() => setFilter("all")} style={{ padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer', background: filter === 'all' ? '#3E2A1A' : '#fff', color: filter === 'all' ? '#fff' : '#000', border: '1px solid #ccc' }}>All</button>
                <button onClick={() => setFilter("active")} style={{ padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer', background: filter === 'active' ? '#3E2A1A' : '#fff', color: filter === 'active' ? '#fff' : '#000', border: '1px solid #ccc' }}>Active</button>
                <button onClick={() => setFilter("completed")} style={{ padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer', background: filter === 'completed' ? '#3E2A1A' : '#fff', color: filter === 'completed' ? '#fff' : '#000', border: '1px solid #ccc' }}>Completed</button>
            </div>

            {loading ? (
                <p>Loading your tasks...</p>
            ) : error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : filteredTasks.length === 0 ? (
                <p className="empty-state">No matching tasks found.</p>
            ) : (
                <div className="table-responsive">
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {filteredTasks.map((item) => {
                            const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'completed';
                            const rowBg = item.status === 'completed' ? '#fcfbf8' : 'var(--clr-surface)';

                            return (
                                <Fragment key={item._id}>
                                    <li style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1.25rem 1rem',
                                        borderBottom: '1px solid var(--clr-border)',
                                        background: rowBg,
                                        marginBottom: '0.5rem',
                                        borderRadius: '8px',
                                        boxShadow: 'var(--shadow-card)'
                                    }}>
                                        <div>
                                            <input
                                                type="checkbox"
                                                checked={item.status === "completed"}
                                                onChange={() => toggleStatus(item._id, item.status)}
                                                style={{ marginRight: '1rem', transform: 'scale(1.2)', accentColor: '#3E2A1A' }}
                                            />
                                            <strong style={{ textDecoration: item.status === 'completed' ? 'line-through' : 'none', color: 'var(--clr-text-primary)', fontSize: '1.05rem' }}>
                                                {item.title}
                                            </strong>
                                            <p style={{ margin: '0.25rem 0 0 2.2rem', fontSize: '0.9rem', color: 'var(--clr-text-secondary)' }}>
                                                {item.description}
                                            </p>
                                            <small style={{ marginLeft: '2.2rem', color: isOverdue ? 'var(--clr-danger)' : '#6b4226', fontWeight: isOverdue ? '600' : 'normal' }}>
                                                Due: {formatDate(item.dueDate)} {isOverdue && "(OVERDUE)"}
                                            </small>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Link to={`/update/${item._id}`} className="update-item" style={{ textDecoration: 'none' }}>Edit</Link>
                                            <button onClick={() => deleteTask(item._id)} className="delete-item" style={{ border: 'none' }}>Delete</button>
                                        </div>
                                    </li>
                                </Fragment>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}