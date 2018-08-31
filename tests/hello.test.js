import * as hello from '../functions/hello';

test('hello', async () => {
  const event = 'event';

  const response = await hello.handler(event);

  expect(response.statusCode).toEqual(200);
  expect(typeof response.body).toBe("string");
});
