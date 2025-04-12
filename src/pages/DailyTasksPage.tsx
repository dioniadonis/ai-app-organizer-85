
const startEditing = (taskId: number, e?: React.MouseEvent) => {
  if (e) e.stopPropagation();
  setEditingTaskId(taskId);
  const task = dailyTasks.find(t => t.id === taskId);
  if (task) {
    setNewTaskName(task.name);
    setNewTaskTime(task.timeOfDay || '');
    setNewTaskCategory(task.category || 'Personal');  // Corrected from setNewCategory
    setNewTaskColor(task.color || COLORS[0]);  // Corrected from setNewColor
  }
};
