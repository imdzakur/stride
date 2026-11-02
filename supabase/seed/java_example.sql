-- supabase/seed/java_example.sql
-- Example content: Software Engineering -> Java -> Basic, Intermediate, Advanced -> items.
-- Run after 0005_topics.sql. Running it twice fails on the unique slug, which protects
-- against duplicates; delete the Java topic first to load it again.
begin;

with topic as (
  insert into public.topics (track, title, sort_order)
  values ('se', 'Java', 1)
  returning id
),
levels as (
  insert into public.sections (topic_id, title, sort_order)
  select topic.id, v.title, v.sort_order
  from topic, (values ('Basic', 1), ('Intermediate', 2), ('Advanced', 3)) as v(title, sort_order)
  returning id, title
)
insert into public.items (section_id, title, sort_order)
select levels.id, v.item, v.sort_order
from levels
join (
  values
    ('Basic', 'JDK and JRE installation', 1),
    ('Basic', 'Variables and data types', 2),
    ('Basic', 'Operators and expressions', 3),
    ('Basic', 'Control flow: if, switch, loops', 4),
    ('Basic', 'Arrays and strings', 5),
    ('Basic', 'Methods and parameters', 6),
    ('Intermediate', 'Classes and objects', 1),
    ('Intermediate', 'Inheritance and polymorphism', 2),
    ('Intermediate', 'Interfaces and abstract classes', 3),
    ('Intermediate', 'Exceptions', 4),
    ('Intermediate', 'Collections framework', 5),
    ('Intermediate', 'Generics', 6),
    ('Advanced', 'Lambdas and streams', 1),
    ('Advanced', 'Concurrency and threads', 2),
    ('Advanced', 'JVM memory and garbage collection', 3),
    ('Advanced', 'Design patterns', 4),
    ('Advanced', 'Testing with JUnit', 5),
    ('Advanced', 'Build tools: Maven or Gradle', 6)
) as v(section, item, sort_order)
  on v.section = levels.title;

commit;

-- Adding your own content later, for example a new item in Java Basic:
--
-- insert into public.items (section_id, title, sort_order)
-- select s.id, 'Packages and imports', 7
-- from public.sections s
-- join public.topics t on t.id = s.topic_id
-- where t.track = 'se' and t.slug = 'java' and s.slug = 'basic';
