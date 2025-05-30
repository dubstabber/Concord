/**
 * Mock for Cloudinary to use in tests
 */

export const cloudinaryMock = {
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn().mockImplementation((imageData, options) => {
        return Promise.resolve({
          secure_url: 'https://mocked-cloudinary-url.com/image.jpg',
          public_id: 'mocked-public-id',
          asset_id: 'mocked-asset-id'
        });
      }),
      destroy: jest.fn().mockResolvedValue({ result: 'ok' })
    }
  }
};
