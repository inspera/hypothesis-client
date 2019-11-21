'use strict';

const { createElement } = require('preact');
const { mount } = require('enzyme');

const ShareLinks = require('../share-links');
const mockImportedComponents = require('./mock-imported-components');

describe('ShareLinks', () => {
  let fakeAnalytics;
  const shareLink =
    'https://hyp.is/go?url=https%3A%2F%2Fwww.example.com&group=testprivate';

  const createComponent = props =>
    mount(
      <ShareLinks
        analyticsEventName="potato-peeling"
        analytics={fakeAnalytics}
        shareURI={shareLink}
        {...props}
      />
    );

  beforeEach(() => {
    fakeAnalytics = {
      track: sinon.stub(),
    };

    ShareLinks.$imports.$mock(mockImportedComponents());
  });

  afterEach(() => {
    ShareLinks.$imports.$restore();
  });

  const encodedLink = encodeURIComponent(shareLink);
  const encodedSubject = encodeURIComponent("Let's Annotate");

  [
    {
      service: 'facebook',
      expectedURI: `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`,
      title: 'Share on Facebook',
    },
    {
      service: 'twitter',
      expectedURI: `https://twitter.com/intent/tweet?url=${encodedLink}&hashtags=annotated`,
      title: 'Tweet share link',
    },
    {
      service: 'email',
      expectedURI: `mailto:?subject=${encodedSubject}&body=${encodedLink}`,
      title: 'Share via email',
    },
  ].forEach(testCase => {
    it(`creates a share link for ${testCase.service} and tracks clicks`, () => {
      const wrapper = createComponent({ shareURI: shareLink });

      const link = wrapper.find(`a[title="${testCase.title}"]`);
      link.simulate('click');

      assert.equal(link.prop('href'), testCase.expectedURI);
      assert.calledWith(
        fakeAnalytics.track,
        'potato-peeling',
        testCase.service
      );
    });
  });
});
