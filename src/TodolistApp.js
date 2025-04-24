import React, { useState, useEffect } from "react";
import "./TodolistApp.css";

function TodolistApp() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      return JSON.parse(savedTasks).map(task => 
        task.id ? task : { ...task, id: Date.now() + Math.random() }
      );
    }
    return [];
  });

  const [input, setInput] = useState("");
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (input.trim()) {
      if (editId !== null) {
        setTasks(tasks.map(task => 
          task.id === editId ? { ...task, text: input, dueDate, priority } : task
        ));
        setEditId(null);
      } else {
        const newTask = {
          id: Date.now(),
          text: input,
          completed: false,
          dueDate,
          priority,
          createdAt: new Date().toISOString()
        };
        setTasks([...tasks, newTask]);
      }
      setInput("");
      setDueDate("");
      setPriority("medium");
    }
  };

  const removeTask = (index) => {
    const removedTask = tasks[index];
    setTasks(tasks.filter((_, i) => i !== index));
    if (removedTask?.id === editId) {
      setEditId(null);
      setInput("");
    }
  };

  const toggleComplete = (index) => {
    setTasks(tasks.map((task, i) => 
      i === index ? { ...task, completed: !task.completed } : task
    ));
  };

  const editTask = (task) => {
    setInput(task.text);
    setDueDate(task.dueDate || "");
    setPriority(task.priority || "medium");
    setEditId(task.id);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "completed") return task.completed;
    if (filter === "active") return !task.completed;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  return (
    <div className="container">
      <h1>To-do List</h1>
      
      <div className="input-section">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="✍️ What needs to be done?"
          onKeyPress={(e) => e.key === "Enter" && addTask()}
          className="task-input"
          autoFocus
        />

        <div className="task-options">
          <div className="option-group">
            <label>📅 Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="date-picker"
            />
          </div>
          
          <div className="option-group">
            <label>🚦 Priority</label>
            <select 
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="priority-select"
            >
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 .Low</option>
            </select>
          </div>
        </div>
        
        <button className="add-btn" onClick={addTask}>
          {editId !== null ? "🔄 Update Task" : "➕ Add Task"}
        </button>
      </div>

      <div className="filter-buttons">
        <button 
          className={`filter-btn ${filter === "all" ? "active" : ""}`} 
          onClick={() => setFilter("all")}
        >
          🌈 All ({tasks.length})
        </button>
        <button 
          className={`filter-btn ${filter === "active" ? "active" : ""}`} 
          onClick={() => setFilter("active")}
        >
          ⏳ Active ({tasks.filter(t => !t.completed).length})
        </button>
        <button 
          className={`filter-btn ${filter === "completed" ? "active" : ""}`} 
          onClick={() => setFilter("completed")}
        >
          ✅ Completed ({tasks.filter(t => t.completed).length})
        </button>
      </div>

      <div className="task-list">
      {sortedTasks.length > 0 ? (
        sortedTasks.map((task, index) => (
          <div 
            key={task.id} 
            className={`task-item ${task.completed ? "completed" : ""}`}
          >
            <div className="task-main">
              <button 
                className={`checkbox ${task.completed ? "checked" : ""}`}
                onClick={() => toggleComplete(index)}
              >
                {task.completed ? "✓" : ""}
              </button>
              <span className="task-text">{task.text}</span>
            </div>
                
            <div className="task-meta">
              {task.dueDate && (
                <span className="due-date">
                  📅 {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
              <span className={`priority-badge ${task.priority}`}>
                {task.priority === "high" ? "🔴" : 
                 task.priority === "medium" ? "🟡" : "🟢"}
              </span>
            </div>
                
            <div className="task-actions">
              <button className="edit-btn" onClick={() => editTask(task)}>
                ✏️ Edit
              </button>
              <button className="delete-btn" onClick={() => removeTask(index)}>
                🗑️ Delete
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="empty-state">
          {filter === "completed" 
            ? "🎉 No completed tasks yet!" 
            : "✨ Add your first task above!"}
        </div>
      )}
      </div>

      {tasks.length > 0 && (
        <div className="progress-container">
          <div 
            className="progress-bar"
            style={{
              width: `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%`
            }}
          ></div>
          <span className="progress-text">
            {tasks.filter(t => t.completed).length} of {tasks.length} tasks completed
            ({Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)}%)
          </span>
        </div>
      )}
    </div>
  );
}

export default TodolistApp;
