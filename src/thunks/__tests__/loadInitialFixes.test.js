import { fixPotsAndImages } from '../loadInitialFixes';
import { newPot } from '../../models/Pot';

function somePots() {
  const p1 = newPot();
  const p2 = newPot();
  return {
    hasLoaded: true,
    potIds: [p1.uuid, p2.uuid],
    pots: {
      [p1.uuid]: p1,
      [p2.uuid]: p2,
    },
  };
}

describe('fixPotsAndImages', () => {
  it("doesn't touch a good thing", () => {
    const inPots = somePots();
    const potWithImageId = inPots.potIds[0];
    inPots.pots[potWithImageId].images3 = ['a.jpg'];
    const inImages = {
      loaded: true,
      images: {
        'a.jpg': {
          name: 'a.jpg',
          fileUri: 'f/a.jpg',
          pots: [potWithImageId],
        },
      },
    };
    const { pots, images } = fixPotsAndImages(inPots, inImages);
    expect(pots).toEqual(inPots);
    expect(images).toEqual(inImages);
  });

  it('deletes images with no URI', () => {
    const inPots = somePots();
    const potWithImageId = inPots.potIds[0];
    inPots.pots[potWithImageId].images3 = ['a.jpg'];
    const inImages = {
      loaded: true,
      images: {
        'a.jpg': {
          name: 'a.jpg',
        },
      },
    };
    const { pots, images } = fixPotsAndImages(inPots, inImages);
    expect(pots.pots[potWithImageId].images3.length).toEqual(0);
    expect(Object.keys(images.images).length).toEqual(0);
  });

  it('reconstructs pots lists in images', () => {
    const inPots = somePots();
    const potWithImageId = inPots.potIds[0];
    inPots.pots[potWithImageId].images3 = ['a.jpg'];
    const inImages = {
      loaded: true,
      images: {
        'a.jpg': {
          name: 'a.jpg',
          fileUri: 'f/a.jpg',
          pots: [],
        },
      },
    };
    const { pots, images } = fixPotsAndImages(inPots, inImages);
    expect(pots).toEqual(inPots);
    expect(images.images['a.jpg'].pots.length).toEqual(1);
    expect(images.images['a.jpg'].pots[0]).toEqual(potWithImageId);
  });

  it('deletes unused images', () => {
    const inPots = somePots();
    const inImages = {
      loaded: true,
      images: {
        'a.jpg': {
          name: 'a.jpg',
          fileUri: 'f/a.jpg',
          pots: [inPots.potIds[0]],
        },
      },
    };
    const { pots, images } = fixPotsAndImages(inPots, inImages);
    expect(pots).toEqual(inPots);
    expect(images).toEqual({
      loaded: true,
      images: {},
    });
  });

  it('removes missing images from pots', () => {
    const inPots = somePots();
    const potWithImageId = inPots.potIds[0];
    inPots.pots[potWithImageId].images3 = ['a.jpg'];
    const inImages = {
      loaded: true,
      images: {},
    };
    const { pots, images } = fixPotsAndImages(inPots, inImages);
    inPots.pots[potWithImageId].images3 = [];
    expect(pots).toEqual(inPots);
    expect(images).toEqual(inImages);
  });
});
