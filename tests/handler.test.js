import * as handler from '../handler';

test('hello', async () => {
  const event = 'event';

  const response = await handler.hello(event);

  expect(response.statusCode).toEqual(200);
  expect(typeof response.body).toBe("string");
});
