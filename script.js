// script.js
document.addEventListener('DOMContentLoaded', function() {
    loadTeacherInfo();
    loadStudents();
    document.getElementById('studentStage').addEventListener('change', updateGradeOptions);
    document.getElementById('studentForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('calculateFees').addEventListener('click', handleCalculateFees);
    document.getElementById('saveTeacher').addEventListener('click', saveTeacherInfo);
    document.getElementById('exportExcel').addEventListener('click', exportToExcel);

    // Add event listeners to icons
    document.querySelectorAll('.icon').forEach(icon => {
        icon.addEventListener('click', function() {
            showModule(this.dataset.target);
        });
    });

    // Show the first module by default
    showModule('teacherModule');
});

function handleFormSubmit(e) {
    e.preventDefault();

    let studentName = document.getElementById('studentName').value;
    let studentStage = document.getElementById('studentStage').value;
    let studentGrade = document.getElementById('studentGrade').value;
    let month = document.getElementById('month').value;
    let monthlyFees = document.getElementById('monthlyFees').value;

    addStudentToList(studentName, studentStage, studentGrade, month, monthlyFees);
    saveStudent(studentName, studentStage, studentGrade, month, monthlyFees);

    // Clear form
    document.getElementById('studentForm').reset();
    updateGradeOptions();
}

function handleCalculateFees() {
    let month = document.getElementById('summaryMonth').value;
    let grade = document.getElementById('summaryGrade').value;
    calculateTotalFees(month, grade);
}

function updateGradeOptions() {
    let studentStage = document.getElementById('studentStage').value;
    let studentGrade = document.getElementById('studentGrade');
    let summaryStage = document.getElementById('summaryGrade');
    let grades;

    switch (studentStage) {
        case 'المرحلة الإبتدائية':
            grades = ['الصف الأول', 'الصف الثاني', 'الصف الثالث', 'الصف الرابع', 'الصف الخامس', 'الصف السادس'];
            break;
        case 'المرحلة الإعدادية':
            grades = ['الصف الأول', 'الصف الثاني', 'الصف الثالث'];
            break;
        case 'المرحلة الثانوية':
            grades = ['الصف الأول', 'الصف الثاني', 'الصف الثالث'];
            break;
    }

    // Clear existing options
    studentGrade.innerHTML = '';
    summaryStage.innerHTML = '';

    // Populate new options
    grades.forEach(grade => {
        let option = document.createElement('option');
        option.value = `${studentStage} ${grade}`;
        option.textContent = `${studentStage} ${grade}`;
        studentGrade.appendChild(option);

        let summaryOption = document.createElement('option');
        summaryOption.value = `${studentStage} ${grade}`;
        summaryOption.textContent = `${studentStage} ${grade}`;
        summaryStage.appendChild(summaryOption);
    });
}

function addStudentToList(name, stage, grade, month, fees) {
    let studentList = document.getElementById('studentList');

    let li = document.createElement('li');
    li.textContent = `الاسم: ${name} | المرحلة: ${stage} | الصف: ${grade} | الشهر: ${month} | الرسوم الشهرية: ${fees} ريال`;

    let deleteButton = document.createElement('button');
    deleteButton.textContent = 'حذف';
    deleteButton.addEventListener('click', function() {
        removeStudent(name, stage, grade, month, fees);
        studentList.removeChild(li);
    });

    li.appendChild(deleteButton);
    studentList.appendChild(li);
}

function saveStudent(name, stage, grade, month, fees) {
    let students = getStudentsFromLocalStorage();
    students.push({ name, stage, grade, month, fees });
    localStorage.setItem('students', JSON.stringify(students));
}

function getStudentsFromLocalStorage() {
    let students = localStorage.getItem('students');
    return students ? JSON.parse(students) : [];
}

function loadStudents() {
    let students = getStudentsFromLocalStorage();
    students.forEach(student => addStudentToList(student.name, student.stage, student.grade, student.month, student.fees));
}

function calculateTotalFees(month, grade) {
    let students = getStudentsFromLocalStorage();
    let totalFees = 0;

    students.forEach(student => {
        if (student.month === month && student.grade === grade) {
            totalFees += parseFloat(student.fees);
        }
    });

    displayTotalFees(grade, totalFees);
}

function displayTotalFees(grade, totalFees) {
    let totalFeesDiv = document.getElementById('totalFees');
    totalFeesDiv.innerHTML = `الصف: ${grade} | إجمالي الرسوم: ${totalFees} ريال`;
}

function removeStudent(name, stage, grade, month, fees) {
    let students = getStudentsFromLocalStorage();
    students = students.filter(student => !(student.name === name && student.stage === stage && student.grade === grade && student.month === month && student.fees === fees));
    localStorage.setItem('students', JSON.stringify(students));
}

function saveTeacherInfo() {
    let teacherName = document.getElementById('teacherName').value;
    let subject = document.getElementById('subject').value;
    localStorage.setItem('teacherInfo', JSON.stringify({ teacherName, subject }));
    displayTeacherInfo();
}

function loadTeacherInfo() {
    let teacherInfo = JSON.parse(localStorage.getItem('teacherInfo'));
    if (teacherInfo) {
        document.getElementById('teacherName').value = teacherInfo.teacherName;
        document.getElementById('subject').value = teacherInfo.subject;
        displayTeacherInfo();
    }
}

function displayTeacherInfo() {
    let teacherInfo = JSON.parse(localStorage.getItem('teacherInfo'));
    if (teacherInfo) {
        let teacherDiv = document.getElementById('teacherInfo');
        if (!teacherDiv) {
            teacherDiv = document.createElement('div');
            teacherDiv.id = 'teacherInfo';
            document.body.insertBefore(teacherDiv, document.body.firstChild);
        }
        teacherDiv.innerHTML = `المعلم: ${teacherInfo.teacherName} | المادة: ${teacherInfo.subject}`;
    }
}

function exportToExcel() {
    let month = document.getElementById('summaryMonth').value;
    let grade = document.getElementById('summaryGrade').value;
    let students = getStudentsFromLocalStorage().filter(student => student.grade === grade && student.month === month);

    if (students.length === 0) {
        alert('لا توجد بيانات لتصديرها.');
        return;
    }

    let data = students.map((student, index) => ({
        'مسلسل': index + 1,
        'اسم الطالب': student.name,
        'المرحلة': student.stage,
        'الصف': student.grade,
        'الرسوم الشهرية': student.fees,
    }));

    // حساب إجمالي الرسوم
    let totalFees = students.reduce((sum, student) => sum + parseFloat(student.fees), 0);
    data.push({
        'مسلسل': '',
        'اسم الطالب': '',
        'المرحلة': '',
        'الصف': '',
        'الرسوم الشهرية': 'إجمالي الرسوم',
        '': totalFees,
    });

    let worksheet = XLSX.utils.json_to_sheet(data);
    let workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

    XLSX.writeFile(workbook, `الطلاب_${grade}_${month}.xlsx`);
}

function showModule(target) {
    document.querySelectorAll('.module').forEach(module => {
        module.style.display = module.id === target ? 'block' : 'none';
    });
    document.querySelector('.modules-container').style.display = 'block';
}
