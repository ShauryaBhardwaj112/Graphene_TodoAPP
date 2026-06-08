import { useEffect, useState } from 'react';
import '../style/addtask.css';
import { useNavigate, useParams } from 'react-router-dom'; 

export default function UpdateTask() {
    const [taskData, setTaskData] = useState({ title: '', description: '', dueDate: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true); // Data fetch hone tak loading state active rahegi
    const [submitting, setSubmitting] = useState(false);
    
    const navigate = useNavigate();
    const { id } = useParams(); // URL params se Task ID extract ki

    // Component load hote hi database se purana task data lane ke liye hook lifecycle execution
    useEffect(() => {
        const fetchTaskDetails = async () => {
            try {
                const response = await fetch(`http://localhost:3200/task/${id}`, {
                    credentials: 'include'
                });
                const result = await response.json();
                
                if (result.success && result.result) {
                    setTaskData({
                        title: result.result.title || '',
                        description: result.result.description || '',
                        // Date field string format handler logic tracking
                        dueDate: result.result.dueDate ? result.result.dueDate.split('T')[0] : ''
                    });
                } else {
                    setError(result.message || "Failed to fetch task details.");
                }
            } catch {
                setError("Server connection failure. Unable to pull records.");
            } finally {
                setLoading(false);
            }
        };

        fetchTaskDetails();
    }, [id]);

    const handleUpdateTaskSubmit = async () => {
        if (!taskData.title?.trim()) {
            setError('Title field validation: Task Title cannot be empty.');
            return;
        }
        setError('');
        setSubmitting(true);

        try {
            // Assessment rule requirement tracking check: PUT action invoked
            const response = await fetch('http://localhost:3200/update-task', {
                method: 'PUT',
                body: JSON.stringify({ _id: id, ...taskData }),
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (result.success) {
                navigate('/'); // Form submission complete hone ke baad index route par send kiya
            } else {
                setError(result.message || 'Something went wrong while modifying task metrics.');
            }
        } catch {
            setError('Network validation failure. Check your backend status log panels.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="form-page">
                <div className="container">
                    <p>Loading task configuration pipelines...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="form-page">
            <div className="container">
                <h1>Edit Existing Task</h1>

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
                    min={new Date().toISOString().split('T')[0]} // Past date blocking
                    onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
                />

                <button
                    onClick={handleUpdateTaskSubmit}
                    className="submit"
                    disabled={submitting}
                    style={{ opacity: submitting ? 0.7 : 1 }}
                >
                    {submitting ? 'Saving changes...' : 'Update Task Details'}
                </button>
            </div>
        </div>
    );
}