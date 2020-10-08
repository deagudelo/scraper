async function getLinks(url, browser) {
  const page = await browser.newPage();
  console.log(`Navigating to ${url}...`);
  await page.goto(url);

  // Wait for pagination to be rendered
  await page.waitForSelector(".ui-search-pagination");
  console.log("waited for pagination");

  var numPages = 5;

  // Get links to the rest of the result pages
  let links = [url];
  if (numPages > 1) {
    let additionalLinks = await page.evaluate(() => {
      const numPagess = 5;
      let linksToOtherPages = Object.values(
        document.getElementsByClassName("andes-pagination__link ui-search-link")
      ).slice(1, numPagess);
      let urls = [];
      for (let linkElement of linksToOtherPages) {
        console.log("Found Href:", linkElement.href);
        urls.push(linkElement.href);
      }
      return urls;
    }, numPages);
    console.log("additionalLinks", additionalLinks);
    links = [...links, ...additionalLinks];
  }
  return links;
}

async function getItemTitles(url, browser) {
  const page = await browser.newPage();
  console.log(`Navigating to ${url}...`);
  await page.goto(url);

  // Wait for search results
  await page.waitForSelector(".ui-search-results");
  console.log("waited for search results");

  return await page.evaluate(() => {
    let titleElements = document.getElementsByClassName(
      "ui-search-item__title"
    );
    let titles = [];
    for (let titleElement of titleElements) {
      console.log(titleElement.textContent);
      titles.push(titleElement.textContent);
    }
    return titles;
  });
}


function removeDuplicates(array){
  return array.filter(function (elem, pos) {
    return array.indexOf(elem) == pos;
  });
}
const scraperObject = {
  url: "https://listado.mercadolibre.com.co/xiaomi#D[A:xiaomi]",
  async scraper(browser) {
    const links = await getLinks(this.url, browser);

    console.log(`Found ${links.length} links:`);
    console.log(links);

    let itemTitles = [];
    const promises = links.map((link) => getItemTitles(link, browser));
    const results = await Promise.all(promises);

    results.forEach((result) => {
      itemTitles = [...itemTitles, ...result];
    });

    console.log(`Found ${itemTitles.length} item titles:`);
    console.log(itemTitles);

    const allWords = itemTitles.join(" ").split(" ");
    const noDuplicates = removeDuplicates(allWords);
    console.log("Words with no duplicates", noDuplicates);
    noDuplicates.forEach(word=>console.log("Word: " + word))
  },
};

module.exports = scraperObject;
