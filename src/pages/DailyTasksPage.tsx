
const handleTaskNameBlur = (taskId: number) => {
  console.log('Blurring task:', taskId);
  
  if (!newTaskName.trim()) {
    // If no name is entered, remove the task completely
    setDailyTasks(prev => prev.filter(t => t.id !== taskId));
  } else {
    // Update the task name if a non-empty name is provided
    setDailyTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, name: newTaskName };
      }
      return t;
    }));
  }
  
  // Always clear the editing state
  setEditingTaskId(null);
};
