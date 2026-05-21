insert into public.courses (id, title, description, thumbnail, category, provider, source_url) values
  ('course-cs50-intro', 'CS50 Introduction to Computer Science', 'Harvard''s famous beginner-friendly computer science course covering algorithms, memory, and problem solving.', 'https://img.youtube.com/vi/8mAITcNt710/hqdefault.jpg', 'Technology', 'Harvard', 'https://cs50.harvard.edu/x/'),
  ('course-html-css-freecodecamp', 'Responsive Web Design', 'freeCodeCamp''s popular web design path covering HTML, CSS, accessibility, and real responsive layouts.', 'https://img.youtube.com/vi/UB1O30fR-EE/hqdefault.jpg', 'Technology', 'freeCodeCamp', 'https://www.freecodecamp.org/learn/2022/responsive-web-design/'),
  ('course-javascript-traversy', 'Modern JavaScript From The Beginning', 'A highly popular JavaScript course focused on fundamentals, DOM work, ES6 features, and real projects.', 'https://img.youtube.com/vi/hdI2bqOjy3c/hqdefault.jpg', 'Technology', 'Traversy Media', 'https://traversymedia.com/'),
  ('course-python-freecodecamp', 'Python for Everybody', 'A widely recommended beginner Python path covering syntax, data structures, web data, and practical programming habits.', 'https://img.youtube.com/vi/8DvywoWv6fI/hqdefault.jpg', 'Technology', 'freeCodeCamp', 'https://www.freecodecamp.org/news/learn-python-free-python-courses-for-beginners/'),
  ('course-react-traversy', 'React Front to Back', 'A project-focused React track that teaches components, hooks, routing, and app structure through build-alongs.', 'https://img.youtube.com/vi/sBws8MSXN7A/hqdefault.jpg', 'Technology', 'Traversy Media', 'https://www.traversymedia.com/'),
  ('course-sql-khanacademy', 'Intro to SQL', 'Khan Academy''s practical SQL course for learning queries, filtering, grouping, and database basics.', 'https://img.youtube.com/vi/HXV3zeQKqGY/hqdefault.jpg', 'Technology', 'Khan Academy', 'https://www.khanacademy.org/computing/computer-programming/sql'),
  ('course-english-speaking', 'English Speaking for Beginners', 'A popular communication-focused path for pronunciation, fluency, and daily conversation practice.', 'https://img.youtube.com/vi/fA5buq7y7_8/hqdefault.jpg', 'Languages', 'British Council', 'https://learnenglish.britishcouncil.org/'),
  ('course-yoga-focus', 'Yoga for Focus and Recovery', 'Short guided sessions that pair breathing practice with movement, designed for daily learning balance.', 'https://img.youtube.com/vi/ysz5S6PUM-U/hqdefault.jpg', 'Ayurveda', 'YouTube', 'https://www.youtube.com/@artofliving'),
  ('course-indian-classical-arts', 'Indian Classical Arts Essentials', 'An approachable intro to rhythm, expression, and performance traditions from curated public lessons.', 'https://img.youtube.com/vi/QH2-TGUlwu4/hqdefault.jpg', 'Indian Arts', 'YouTube', 'https://www.youtube.com/')
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  thumbnail = excluded.thumbnail,
  category = excluded.category,
  provider = excluded.provider,
  source_url = excluded.source_url;

insert into public.lectures (id, course_id, title, youtube_video_id, order_index) values
  ('lecture-cs50-1', 'course-cs50-intro', 'What is computer science?', '8mAITcNt710', 1),
  ('lecture-cs50-2', 'course-cs50-intro', 'Programming basics and problem solving', 'xvFZjo5PgG0', 2),
  ('lecture-html-1', 'course-html-css-freecodecamp', 'HTML structure and semantic tags', 'UB1O30fR-EE', 1),
  ('lecture-html-2', 'course-html-css-freecodecamp', 'Responsive layouts with CSS', 'yfoY53QXEnI', 2),
  ('lecture-js-1', 'course-javascript-traversy', 'JavaScript fundamentals', 'hdI2bqOjy3c', 1),
  ('lecture-js-2', 'course-javascript-traversy', 'DOM, events, and browser APIs', 'hdI2bqOjy3c', 2),
  ('lecture-python-1', 'course-python-freecodecamp', 'Python syntax and data types', '8DvywoWv6fI', 1),
  ('lecture-python-2', 'course-python-freecodecamp', 'Functions, modules, and files', '8DvywoWv6fI', 2),
  ('lecture-react-1', 'course-react-traversy', 'React setup and components', 'sBws8MSXN7A', 1),
  ('lecture-react-2', 'course-react-traversy', 'State, hooks, and data flow', 'sBws8MSXN7A', 2),
  ('lecture-sql-1', 'course-sql-khanacademy', 'SQL queries and filters', 'HXV3zeQKqGY', 1),
  ('lecture-sql-2', 'course-sql-khanacademy', 'Joins and grouping', 'HXV3zeQKqGY', 2),
  ('lecture-english-1', 'course-english-speaking', 'Pronunciation and everyday phrases', 'fA5buq7y7_8', 1),
  ('lecture-english-2', 'course-english-speaking', 'Fluency practice and conversation', 'fA5buq7y7_8', 2),
  ('lecture-yoga-1', 'course-yoga-focus', 'Breathwork for steady attention', 'ysz5S6PUM-U', 1),
  ('lecture-yoga-2', 'course-yoga-focus', 'Mobility and recovery flow', 'aqz-KE-bpKQ', 2),
  ('lecture-arts-1', 'course-indian-classical-arts', 'Understanding rhythm patterns', 'QH2-TGUlwu4', 1),
  ('lecture-arts-2', 'course-indian-classical-arts', 'Story, gesture, and stage presence', 'M7lc1UVf-VE', 2)
on conflict (id) do update set
  course_id = excluded.course_id,
  title = excluded.title,
  youtube_video_id = excluded.youtube_video_id,
  order_index = excluded.order_index;
