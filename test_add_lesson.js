// Node 18+ has fetch globally.
// actually, let's use standard http to avoid dependencies if possible, or just assume node 18+ has fetch
// Node 18+ has fetch globally.

async function testAddLesson() {
    try {
        // 1. Get a course and module to add to
        const coursesRes = await fetch('http://localhost:3000/courses');
        const courses = await coursesRes.json();

        if (courses.length === 0) {
            console.log('No courses found. Cannot test.');
            return;
        }

        const course = courses[0];
        if (course.modules.length === 0) {
            console.log('No modules found in course. Cannot test.');
            return;
        }
        const module = course.modules[0];

        console.log(`Adding lesson to Course: ${course.title}, Module: ${module.title}`);

        const lessonData = {
            title: "Test API Lesson",
            videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            content: "Test Content"
        };

        const res = await fetch(`http://localhost:3000/courses/${course.id}/modules/${module.id}/lessons`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lessonData)
        });

        const data = await res.json();
        console.log('Response:', data);

    } catch (error) {
        console.error('Error:', error);
    }
}

testAddLesson();
