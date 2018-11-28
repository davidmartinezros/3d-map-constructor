import { TheNewWebConceptPage } from './app.po';

describe('TheNewWebConceptPage App', () => {
  let page: TheNewWebConceptPage;

  beforeEach(() => {
    page = new TheNewWebConceptPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
