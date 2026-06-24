"use client";

// TodoItem：顯示單一任務
// props:
// - todo: { id, title, is_complete, user_id, created_at }
// - onToggle(id, currentIsComplete): 切換完成狀態
// - onDelete(id): 刪除任務
export default function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className={`todo-item ${todo.is_complete ? "completed" : ""}`}>
      <input
        type="checkbox"
        className="todo-checkbox"
        checked={todo.is_complete}
        onChange={() => onToggle(todo.id, todo.is_complete)}
      />
      <span
        className="todo-text"
        onClick={() => onToggle(todo.id, todo.is_complete)}
      >
        {todo.title}
      </span>
      <button
        className="todo-delete-btn"
        onClick={() => onDelete(todo.id)}
        aria-label="刪除任務"
        title="刪除任務"
      >
        ✕
      </button>
    </li>
  );
}
