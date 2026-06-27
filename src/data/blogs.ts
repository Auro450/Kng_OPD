export interface BlogPost {
  title: string;
  slug: string;
  category: string;
  readtime: string;
  description: string;
  imageurl: string;
  content: string;
  date: string;
  author: string;
}

export const ORIGINAL_BLOGS: BlogPost[] = [
  {
    title: "10 Superfoods to Boost Your Heart Health Today",
    slug: "10-superfoods-to-boost-your-heart-health-today",
    category: "Nutrition",
    readtime: "5 min read",
    description: "Discover how small changes in your diet can lead to significant improvements in cardiovascular health.",
    imageurl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDn8tqjPNru_4IRXUOEgOYT5Ov_5TOUityVoFmT2KjxAvOcnKdBADRHf_y2j-x7HkDVZyCbMwjVOd8kTSWQKL5Yp1DRKrBF2_mfZYhTLlTYVnWdQuY26NkVarWhAdBJxlbCS_N45KxLgP7_PH49cQFxGHZp70iWw_EiCPPckyQ0BdNOhArBDJbrYv9GtVGfyYVTRipnIiWFjJERl5n5dYuPZGWDkaHlNpa6oL39ABPLAhCB0gSv1IMB2_hTnSywmSeIux7FjICh4EUN",
    date: "August 12, 2026",
    author: "Dr. Sarah Jenkins, Nutritionist",
    content: `
      <h2>The Foundation of a Healthy Heart</h2>
      <p>Cardiovascular health is one of the most critical aspects of overall well-being. According to leading cardiologists, diet plays a monumental role in preventing heart disease and managing blood pressure. By incorporating specific nutrient-dense foods—often called "superfoods"—into your daily routine, you can naturally lower cholesterol, reduce inflammation, and improve arterial function.</p>
      
      <h2>Top Heart-Healthy Superfoods</h2>
      <ul>
        <li><strong>Leafy Green Vegetables:</strong> Spinach, kale, and collard greens are renowned for their wealth of vitamins, minerals, and antioxidants. In particular, they’re a great source of vitamin K, which helps protect your arteries and promote proper blood clotting.</li>
        <li><strong>Berries:</strong> Strawberries, blueberries, blackberries, and raspberries are jam-packed with essential nutrients that play a central role in heart health. Berries are also rich in antioxidants like anthocyanins, which protect against the oxidative stress and inflammation that contribute to the development of heart disease.</li>
        <li><strong>Avocados:</strong> Avocados are an excellent source of heart-healthy monounsaturated fats, which have been linked to reduced levels of cholesterol and a lower risk of heart disease.</li>
        <li><strong>Fatty Fish and Fish Oil:</strong> Fatty fish like salmon, mackerel, sardines, and tuna are loaded with omega-3 fatty acids, which have been studied extensively for their heart-health benefits.</li>
        <li><strong>Walnuts:</strong> Walnuts are a great source of fiber and micronutrients like magnesium, copper, and manganese. Research shows that incorporating a few servings of walnuts into your diet can help protect against heart disease.</li>
        <li><strong>Dark Chocolate:</strong> Dark chocolate is rich in antioxidants like flavonoids, which can help boost heart health. Interestingly, several studies have associated eating chocolate with a lower risk of heart disease.</li>
        <li><strong>Tomatoes:</strong> Tomatoes are loaded with lycopene, a natural plant pigment with powerful antioxidant properties. Low levels of lycopene are linked to an increased risk of heart attack and stroke.</li>
        <li><strong>Almonds:</strong> Almonds are incredibly nutrient-dense, boasting a long list of vitamins and minerals that are crucial to heart health. They are also a good source of heart-healthy monounsaturated fats and fiber.</li>
        <li><strong>Chia Seeds and Flaxseeds:</strong> Both chia seeds and flaxseeds are great sources of plant-based omega-3 fatty acids, fiber, and phytoestrogens, all of which are beneficial for heart health.</li>
        <li><strong>Green Tea:</strong> Green tea has been associated with a number of health benefits, from increased fat burning to improved insulin sensitivity. It’s also brimming with polyphenols and catechins, which can act as antioxidants to prevent cell damage and reduce inflammation.</li>
      </ul>

      <h2>Making the Change</h2>
      <p>Incorporating these foods into your diet doesn't have to be overwhelming. Start small by replacing an afternoon snack with a handful of almonds, or swapping your morning coffee for a cup of antioxidant-rich green tea. Your heart works tirelessly for you every single day—give it the fuel it needs to keep beating strong.</p>
    `
  },
  {
    title: "The Mental Health Benefits of Daily Physical Movement",
    slug: "the-mental-health-benefits-of-daily-physical-movement",
    category: "Wellness",
    readtime: "8 min read",
    description: "Recent studies show that even 15 minutes of activity can drastically reduce stress levels.",
    imageurl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKsUkvHQb5PCPeCcfmXRRPZ2a9CAZjXEwUJYg7NIE3_6UMaKbthgNRrsxTiwG0XVrMYk__p5B4vGOzIHNytx3r_n6ufKzfYC3CvK2-smJTm5KDTz9QVrg8f7jdF8fuZB3ncMuLHsKA2jeRpXIDrllyeFl_OFCjBhFYcAKyoLiBh07DUP7pyLygortitRS8mY1g5nprgC-y_UuEyYFKKkR39Pd_i_9LGddOzhzjSigolLL7rCkngDtmbbTR-eQ4MZd8jf1_n7yLPG_2",
    date: "July 28, 2026",
    author: "Dr. Emily Roberts, Psychiatrist",
    content: `
      <h2>The Mind-Body Connection</h2>
      <p>When we think about exercise, we often focus exclusively on the physical results: weight loss, muscle tone, and endurance. However, the most profound benefits of physical movement often happen invisibly, within the architecture of our brains. The connection between physical activity and mental well-being is not just anecdotal; it is deeply rooted in neurochemistry.</p>
      
      <h2>How Movement Alters Brain Chemistry</h2>
      <p>Engaging in just 15 to 20 minutes of moderate physical activity triggers a cascade of neurochemical changes. Your brain releases endorphins—often referred to as the body's natural painkillers and mood elevators. Simultaneously, exercise increases the production of serotonin and dopamine, neurotransmitters that play crucial roles in regulating mood, sleep, and overall happiness.</p>
      
      <h3>Key Mental Health Benefits</h3>
      <ul>
        <li><strong>Reduced Anxiety and Depression:</strong> Numerous studies have demonstrated that regular exercise can be as effective as antidepressant medication in treating mild to moderate depression, but without the side effects. It promotes neural growth and reduces inflammation in the brain.</li>
        <li><strong>Stress Relief:</strong> Physical activity helps manage the body's stress response by reducing levels of cortisol and adrenaline. The rhythm of movement, whether walking, swimming, or cycling, also acts as a form of moving meditation, allowing the mind to break free from cycles of worry.</li>
        <li><strong>Enhanced Cognitive Function:</strong> Exercise stimulates the production of BDNF (Brain-Derived Neurotrophic Factor), a protein that acts like fertilizer for the brain. It encourages the growth of new neurons and strengthens connections between existing ones, improving memory and focus.</li>
        <li><strong>Better Sleep:</strong> Regular physical activity helps regulate your circadian rhythm. It raises your core body temperature, and the subsequent drop in temperature a few hours later helps signal to your body that it's time to sleep.</li>
      </ul>

      <h2>Finding Your Routine</h2>
      <p>The goal isn't necessarily to run a marathon or spend hours in the gym. The key is consistency and finding a form of movement that brings you joy. Whether it's a brisk walk in nature, an evening yoga session, or dancing in your living room, the mental health benefits are universally accessible. At Ray's Medical, we advocate for a holistic approach to health, where caring for your mind is just as important as caring for your body.</p>
    `
  },
  {
    title: "How AI is Revolutionizing Early Cancer Diagnosis",
    slug: "how-ai-is-revolutionizing-early-cancer-diagnosis",
    category: "Technology",
    readtime: "6 min read",
    description: "Exploring the integration of machine learning in our diagnostic centre to provide unprecedented accuracy.",
    imageurl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLSTdyoAefhp0yDiu-Lk1K3-EWk_RwBsf21h_p0G2utNesHiQa4LCfWx6TlfnzKjIWsaMcDpxAANgq17TGs1j3oFRYF9UfFwbLLYFZ9zgUFjGG6fubhGE9XWKTikgHyX11ycGsu-pnTHd0gzcGRS-i4_60RgFr8pAbP4HjvbVJ3NdqbK3p3XXWrt0Yt7FKZVobK46nuZKMwZdxVucgZBconBZAW2TrYRpqqi5wlfy2vIqqI9C1lgnv-ghhriMwtw6HxpKwOW9RSriZ",
    date: "July 15, 2026",
    author: "Dr. Marcus Chen, Head of Radiology",
    content: `
      <h2>A New Era in Diagnostic Medicine</h2>
      <p>Early detection has always been the holy grail of oncology. The sooner cancer is identified, the higher the chances of successful treatment and survival. For decades, we have relied on the trained eyes of pathologists and radiologists to identify microscopic anomalies. Today, Artificial Intelligence (AI) and Machine Learning (ML) are acting as a powerful force multiplier for our medical experts, ushering in a new era of precision medicine.</p>
      
      <h2>The Power of Pattern Recognition</h2>
      <p>AI algorithms are exceptionally good at pattern recognition. By training these systems on millions of high-resolution medical images—spanning MRIs, CT scans, and biopsies—they learn to identify the most subtle indicators of malignancy that might elude even the most experienced human eye. An AI system doesn't experience fatigue, distraction, or cognitive bias, ensuring a consistent standard of analysis for every single patient.</p>
      
      <h3>Real-World Applications</h3>
      <ul>
        <li><strong>Mammography:</strong> AI tools are currently being used to assist radiologists in reading mammograms. They can highlight suspicious microcalcifications or masses, significantly reducing the rate of false negatives in breast cancer screening.</li>
        <li><strong>Dermatology:</strong> Machine learning algorithms can analyze skin lesions with remarkable accuracy, often outperforming human dermatologists in distinguishing between benign moles and malignant melanomas.</li>
        <li><strong>Pathology:</strong> In the lab, AI assists pathologists by quickly scanning tissue slides to pinpoint areas of interest, speeding up the diagnostic process and allowing the pathologist to focus their expertise where it's needed most.</li>
      </ul>

      <h2>AI as a Collaborative Tool</h2>
      <p>It's important to understand that AI is not replacing doctors; it is empowering them. At Ray's Medical, we view AI as an advanced collaborative tool. The algorithm acts as a tireless second reader, flagging potential issues for our experts to review. The final diagnosis and treatment plan are always determined by a human physician, combining the empathetic care of a doctor with the computational power of artificial intelligence.</p>
      
      <p>As we continue to integrate these cutting-edge technologies into our diagnostic centre, we remain committed to our primary goal: providing our patients with the most accurate, rapid, and compassionate care possible.</p>
    `
  }
];
