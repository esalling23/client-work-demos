export const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
export const errorSpy = jest
  .spyOn(console, 'error')
  .mockImplementation(() => {});
export const infoSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
export const dispatchEventSpy = jest.spyOn(
  EventTarget.prototype,
  'dispatchEvent',
);
