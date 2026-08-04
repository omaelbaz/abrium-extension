import fs from 'fs';
import * as cheerio from 'cheerio';

const htmlContent = fs.readFileSync('./design-reference/Abrium.html', 'utf-8');
const $ = cheerio.load(htmlContent);

const extractedData = {
  hero: {},
  features: {},
  howItWorks: {},
  footer: {}
};

// Hero Section
const heroSection = $('header.relative.z-20');
extractedData.hero.eyebrow = heroSection.find('.inline-flex.items-center.rounded-full span').text().trim();
extractedData.hero.headline = heroSection.find('h1').text().trim();
extractedData.hero.body = heroSection.find('h1').next('p').text().trim();
extractedData.hero.primaryButton = heroSection.find('a[href="#how-it-works"]').text().trim();
extractedData.hero.secondaryButton = heroSection.find('a[href="https://chromewebstore.google.com/detail/abrium/"]').text().trim();

// Trust Checklist (just below hero)
const trustItems = [];
heroSection.find('ul li').each((i, el) => {
  trustItems.push($(el).text().trim());
});
extractedData.hero.trustChecklist = trustItems;

// Features Section
const featuresSection = $('#features');
extractedData.features.heading = featuresSection.find('h2').text().trim();
extractedData.features.subheading = featuresSection.find('p').first().text().trim();

const featureCards = [];
featuresSection.find('.grid > div').each((i, el) => {
  featureCards.push({
    title: $(el).find('h3').text().trim(),
    description: $(el).find('p').text().trim()
  });
});
extractedData.features.cards = featureCards;


// How It Works Section
const howItWorksSection = $('#how-it-works');
extractedData.howItWorks.heading = howItWorksSection.find('h2').text().trim();
extractedData.howItWorks.subheading = howItWorksSection.find('h2').next('p').text().trim();

const steps = [];
howItWorksSection.find('.grid > div').each((i, el) => {
  steps.push({
    stepNumber: $(el).find('.flex.h-12.w-12').text().trim(),
    title: $(el).find('h3').text().trim(),
    description: $(el).find('p').text().trim()
  });
});
extractedData.howItWorks.steps = steps;

// Pre-footer CTA
const ctaSection = $('section').last();
extractedData.cta = {
  heading: ctaSection.find('h2').text().trim(),
  body: ctaSection.find('p').text().trim(),
  button: ctaSection.find('a').text().trim()
};

// Footer
const footer = $('footer');
extractedData.footer.description = footer.find('p').first().text().trim();

const footerLinks = {
  product: [],
  resources: [],
  legal: []
};

footer.find('h3:contains("Product")').next('ul').find('li a').each((i, el) => {
    footerLinks.product.push($(el).text().trim());
});
footer.find('h3:contains("Resources")').next('ul').find('li a').each((i, el) => {
    footerLinks.resources.push($(el).text().trim());
});
footer.find('h3:contains("Legal")').next('ul').find('li a').each((i, el) => {
    footerLinks.legal.push($(el).text().trim());
});

extractedData.footer.links = footerLinks;
extractedData.footer.copyright = footer.find('p').last().text().trim();

console.log(JSON.stringify(extractedData, null, 2));
