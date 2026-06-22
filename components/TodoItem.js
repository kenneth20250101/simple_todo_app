"use client";

// 單一任務的顯示元件
// props:
// - todo: { id, text, completed }
// - onToggle(id): 切換完成狀態
// - onDelete(id): 刪除任務
export default function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className={`todo-item ${todo.completed ? "completed" : ""}`}>
      <input
        type="checkbox"
        className="todo-checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span className="todo-text" onClick={() => onToggle(todo.id)}>
        {todo.text}
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
