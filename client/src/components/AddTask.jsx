import { useState } from 'react'
import '../style/addtask.css'
import { useNavigate } from 'react-router-dom';

export default function AddTask() {
    // Form management state variables
    const [taskData, setTaskData] = useState({ title: '', description: '', dueDate: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Form submit handler function
    const handleAddTask = async () => {
        // Validation check: Title empty space filter
        if (!taskData.title?.trim()) {
            setError('Title is required.');
            return;
        }
        setError('');
        setLoading(true);

        try {
            const response = await fetch('${import.meta.env.VITE_API_URL}/add-task', {
                method: 'POST',
                body: JSON.stringify(taskData),
                // Backend with credentials handle karne ke liye cookie cross-origin bhej rahe hain
                credentials: 'include',             
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (result.success) {
                navigate('/');
            } else {
                setError(result.message || 'Something went wrong. Try again.');
            }
        } catch {
            setError('Cannot connect to server. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-page">
            <div className="container">
                <h1>Add New Task</h1>

                {error && <p className="form-error">{error}</p>}

                <label htmlFor="title">
                    Title <span style={{ color: 'var(--clr-danger)' }}>*</span>
                </label>
                <input
                    id="title"
                    type="text"
                    name="title"
                    placeholder="Enter task title"
                    value={taskData.title}
                    onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                />

                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    rows={4}
                    name="description"
                    placeholder="Enter task description (optional)"
                    value={taskData.description}
                    onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                />

                <label htmlFor="dueDate">Due Date</label>
                <input
                    id="dueDate"
                    type="date"
                    name="dueDate"
                    value={taskData.dueDate}
                    // Calendar validation trick: Aaj ke pehle ki date select nahi honi chahiye
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
                />

                <button
                    onClick={handleAddTask}
                    className="submit"
                    disabled={loading}
                    style={{ opacity: loading ? 0.7 : 1 }}
                >
                    {loading ? 'Adding...' : 'Add New Task'}
                </button>
            </div>
        </div>
    );
}