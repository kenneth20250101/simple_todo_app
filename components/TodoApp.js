"use client";

import { useState } from "react";
import TodoItem from "./TodoItem";

// 簡單的 id 產生器，給每個任務一個獨一無二的編號
let nextId = 1;

export default function TodoApp() {
  // todos: 儲存所有任務的陣列，每個任務是 { id, text, completed }
  const [todos, setTodos] = useState([]);
  // inputValue: 輸入框目前的文字內容
  const [inputValue, setInputValue] = useState("");

  // 新增任務
  function handleAddTodo() {
    const trimmedText = inputValue.trim();

    // 空白輸入不新增
    if (trimmedText === "") {
      return;
    }

    const newTodo = {
      id: nextId++,
      text: trimmedText,
      completed: false,
    };

    setTodos((prevTodos) => [...prevTodos, newTodo]);
    setInputValue(""); // 清空輸入框
  }

  // 按下 Enter 鍵也可以新增任務
  function handleKeyDown(event) {
    if (event.key === "Enter") {
      handleAddTodo();
    }
  }

  // 切換任務完成 / 未完成狀態
  function handleToggleTodo(id) {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }

  // 刪除任務
  function handleDeleteTodo(id) {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
  }

  // 計算統計數字
  const totalCount = todos.length;
  const completedCount = todos.filter((todo) => todo.completed).length;

  return (
    <div className="todo-app">
      <h1 className="todo-title">📝 ToDo App</h1>

      {/* 輸入區：輸入框 + 新增按鈕 */}
      <div className="todo-input-row">
        <input
          type="text"
          className="todo-input"
          placeholder="輸入新的任務..."
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="todo-add-btn" onClick={handleAddTodo}>
          新增
        </button>
      </div>

      {/* 統計列：顯示總數與已完成數 */}
      <div className="todo-stats">
        <span>
          總共 <strong>{totalCount}</strong> 項任務
        </span>
        <span>
          已完成 <span className="highlight">{completedCount}</span> 項
        </span>
      </div>

      {/* 任務列表 或 空狀態文字 */}
      {todos.length === 0 ? (
        <p className="todo-empty">目前沒有任務，新增一筆開始吧！</p>
      ) : (
        <ul className="todo-list">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggleTodo}
              onDelete={handleDeleteTodo}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
