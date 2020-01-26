import { saveImagesToFiles } from '../loadInitialImages';
import { saveToFile } from '../images';

jest.mock('../images', () => ({
  saveToFile: jest.fn().mockReturnValue(Promise.resolve()),
}));

describe('saveImagesToFiles', () => {
  it('saves images to files', async () => {
    const inImages = {
      loaded: true,
      images: {
        'a.jpg': {
          name: 'a.jpg',
          remoteUri: 'r/a.jpg',
          pots: ['1'],
        },
        'b.jpg': {
          name: 'b.jpg',
          localUri: 'l/b.jpg',
          pots: ['1'],
        },
      },
    };
    await saveImagesToFiles(() => {}, inImages);
    expect(saveToFile).toHaveBeenCalledWith('r/a.jpg', true);
    expect(saveToFile).toHaveBeenCalledWith('l/b.jpg', false);
  });
});
