let content;
export const setContent = (c) => {
  content = c;
};
export const getContent = () => content;

export const getLevelContent = (id) =>
  getContent()
		?.standardLevels
		?.find(({ level }) => level.id === id) || [];

export const getAvailableLevels = () =>
  getContent()?.standardLevels?.map(({ level }) => level) || [];
