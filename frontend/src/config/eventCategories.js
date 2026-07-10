const eventCategories = [
  {
    id: 'meeting',
    name: 'Meeting',
    color: '#5A8DEE',
  },
  {
    id: 'workout',
    name: 'Workout',
    color: '#4F9D69',
  },
  {
    id: 'birthday',
    name: 'Birthday',
    color: '#D76B7A',
  },
  {
    id: 'finance',
    name: 'Finance',
    color: '#D6A756',
  },
  {
    id: 'travel',
    name: 'Travel',
    color: '#4FB9CF',
  },
  {
    id: 'study',
    name: 'Study',
    color: '#5C6CC0',
  },
  {
    id: 'personal',
    name: 'Personal',
    color: '#8D5ADE',
  },
  {
    id: 'other',
    name: 'Other',
    color: '#5D5D81',
  },
]

const eventCategoryMap = eventCategories.reduce((map, category) => {
  map[category.id] = category
  return map
}, {})

export { eventCategories, eventCategoryMap }
export default eventCategories
