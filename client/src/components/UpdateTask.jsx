import { useEffect, useState } from 'react';
import '../style/addtask.css';
import { useNavigate, useParams } from 'react-router-dom';

export default function UpdateTask() {
    const [taskData, setTaskData] = useState({ title: '', description: '', dueDate: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true); // Active until existing task data is fetched
    const [submitting, setSubmitting] = useState(false);

    const navigate = useNavigate();
    const { id } = useParams(); // Extract task ID from URL params

    // Fetch existing task data when component mounts
    useEffect(() => {
        const fetchTaskDetails = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/task/${id}`, {
                    credentials: 'include'
                });
                const result = await response.json();

                if (result.success && result.result) {
                    setTaskData({
                        title: result.result.title || '',
                        description: result.result.description || '',
                        // Convert ISO date string to yyyy-mm-dd for the date input field
                        dueDate: result.result.dueDate ? result.result.dueDate.split('T')[0] : ''
                    });
                } else {
                    setError(result.message || 'Failed to fetch task details.');
                }
            } catch {
                setError('Server connection failed. Unable to load task.');
            } finally {
                setLoading(false);
            }
        };

        fetchTaskDetails();
    }, [id]);

    // Update task submit handler
    const handleUpdateTaskSubmit = async () => {
        if (!taskData.title?.trim()) {
            setError('Task title cannot be empty.');
            return;
        }
        setError('');
        setSubmitting(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/update-task/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ _id: id, ...taskData }),
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (result.success) {
                navigate('/'); // Redirect to task list after successful update
            } else {
                setError(result.message || 'Something went wrong. Please try again.');
            }
        } catch {
            setError('Cannot connect to server. Please check if the backend is running.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="form-page">
                <div className="container">
                    <p>Loading task details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="form-page">
            <div className="container">
                <h1>Edit Task</h1>

                {error && <p className="form-error" style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

                <label htmlFor="title">Task Title</label>
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
                    min={new Date().toISOString().split('T')[0]} // Block past dates
                    onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
                />

                <button
                    onClick={handleUpdateTaskSubmit}
                    className="submit"
                    disabled={submitting}
                    style={{ opacity: submitting ? 0.7 : 1 }}
                >
                    {submitting ? 'Saving changes...' : 'Update Task'}
                </button>
            </div>
        </div>
    );
}