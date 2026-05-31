// ========== Firebase Configuration ==========
// استبدل هذه البيانات ببيانات مشروعك من Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAG3UDzuX2KtywV7QeGOKPIvIHeYG7o8fI",
  authDomain: "police-database-system.firebaseapp.com",
  databaseURL: "https://police-database-system-default-rtdb.firebaseio.com",
  projectId: "police-database-system",
  storageBucket: "police-database-system.appspot.com",
  messagingSenderId: "535628647936",
  appId: "1:535628647936:web:3f76abd317e08f469852e5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Database References
const citizensRef = database.ref('citizens');
const vehiclesRef = database.ref('vehicles');
const recordsRef = database.ref('records');

// ========== Initialize Page ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Police Data System تم التحميل بنجاح');
    loadAllRecords();
    updateLastModified();
    checkFirebaseConnection();
});

// ========== Check Firebase Connection ==========
function checkFirebaseConnection() {
    database.ref('.info/connected').on('value', snap => {
        if (snap.val() === true) {
            console.log('✅ متصل بـ Firebase');
        } else {
            console.warn('❌ غير متصل بـ Firebase');
            alert('⚠️ تحقق من الاتصال بـ Firebase');
        }
    });
}

// ========== Show/Hide Sections ==========
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Remove active state from all buttons
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => btn.classList.remove('active'));
    
    // Show selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
    
    // Mark button as active
    event.target.classList.add('active');
    console.log('📂 تم فتح القسم:', sectionId);
}

// ========== Search by Vehicle Plate ==========
function searchByPlate() {
    const plate = document.getElementById('searchInput').value.trim().toUpperCase();
    
    if (!plate) {
        alert('❌ الرجاء إدخال لوحة السيارة');
        document.getElementById('searchInput').focus();
        return;
    }
    
    console.log('🔍 جاري البحث عن اللوحة:', plate);
    
    // Find vehicle by plate
    vehiclesRef.orderByChild('plate').equalTo(plate).once('value', snapshot => {
        if (snapshot.exists()) {
            const vehicles = snapshot.val();
            const vehicleKey = Object.keys(vehicles)[0];
            const vehicleData = vehicles[vehicleKey];
            
            console.log('✅ تم العثور على السيارة:', vehicleData);
            
            // Get citizen data using owner ID
            citizensRef.orderByChild('id').equalTo(vehicleData.ownerId).once('value', citizenSnapshot => {
                if (citizenSnapshot.exists()) {
                    const citizens = citizenSnapshot.val();
                    const citizenKey = Object.keys(citizens)[0];
                    const citizenData = citizens[citizenKey];
                    
                    console.log('✅ تم العثور على بيانات المواطن:', citizenData.name);
                    
                    // Display results
                    displaySearchResults(citizenData, vehicleData);
                    
                    // Get security records
                    recordsRef.child(vehicleData.ownerId).once('value', recordSnapshot => {
                        if (recordSnapshot.exists()) {
                            const recordData = recordSnapshot.val();
                            console.log('✅ تم العثور على السجلات الأمنية');
                            displaySecurityRecords(recordData);
                        } else {
                            console.log('⚠️ لا توجد سجلات أمنية لهذا المواطن');
                            document.getElementById('violations').textContent = 'لا توجد مخالفات';
                            document.getElementById('fines').textContent = '-';
                            document.getElementById('reports').textContent = '-';
                            document.getElementById('notes').textContent = '-';
                        }
                    });
                } else {
                    console.error('❌ لم يتم العثور على بيانات المواطن');
                    showNoResults();
                }
            });
        } else {
            console.error('❌ لم يتم العثور على السيارة بهذه اللوحة');
            showNoResults();
        }
    }).catch(error => {
        console.error('❌ خطأ في البحث:', error);
        alert('❌ حدث خطأ في البحث: ' + error.message);
    });
}

// ========== Display Search Results ==========
function displaySearchResults(citizen, vehicle) {
    console.log('📊 عرض نتائج البحث للمواطن:', citizen.name);
    
    // Display citizen data
    document.getElementById('citizenName').textContent = citizen.name || '-';
    document.getElementById('citizenAge').textContent = citizen.age || '-';
    document.getElementById('citizenBirthDate').textContent = citizen.birthDate || '-';
    document.getElementById('citizenJob').textContent = citizen.job || '-';
    document.getElementById('citizenPhone').textContent = citizen.phone || '-';
    document.getElementById('citizenAddress').textContent = citizen.address || '-';
    document.getElementById('citizenID').textContent = citizen.id || '-';
    
    // Display vehicle data
    document.getElementById('vehiclePlate').textContent = vehicle.plate || '-';
    document.getElementById('vehicleType').textContent = vehicle.type || '-';
    document.getElementById('vehicleColor').textContent = vehicle.color || '-';
    document.getElementById('vehicleYear').textContent = vehicle.year || '-';
    document.getElementById('vehicleStatus').textContent = vehicle.status || '-';
    
    // Show results container
    document.getElementById('searchResults').style.display = 'block';
    document.getElementById('noResults').style.display = 'none';
    
    console.log('✅ تم عرض النتائج بنجاح');
}

// ========== Display Security Records ==========
function displaySecurityRecords(records) {
    console.log('🚨 عرض السجلات الأمنية');
    
    document.getElementById('violations').textContent = records.violations || 'لا توجد مخالفات';
    document.getElementById('fines').textContent = records.fines || '-';
    document.getElementById('reports').textContent = records.reports || '-';
    document.getElementById('notes').textContent = records.notes || '-';
}

// ========== Show No Results ==========
function showNoResults() {
    console.warn('⚠️ لم يتم العثور على بيانات');
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('noResults').style.display = 'block';
    document.getElementById('searchInput').value = '';
    alert('❌ لم يتم العثور على بيانات\nتحقق من لوحة السيارة وحاول مرة أخرى');
}

// ========== Add New Citizen ==========
function addCitizen(event) {
    event.preventDefault();
    
    const citizenData = {
        name: document.getElementById('newCitizenName').value.trim(),
        age: parseInt(document.getElementById('newCitizenAge').value),
        birthDate: document.getElementById('newCitizenBirthDate').value,
        id: document.getElementById('newCitizenID').value.trim(),
        job: document.getElementById('newCitizenJob').value.trim(),
        phone: document.getElementById('newCitizenPhone').value.trim(),
        address: document.getElementById('newCitizenAddress').value.trim(),
        createdAt: new Date().toISOString()
    };
    
    console.log('➕ جاري إضافة مواطن جديد:', citizenData.name);
    
    // Validate data
    if (!citizenData.name || !citizenData.id || !citizenData.phone || !citizenData.address) {
        alert('❌ الرجاء ملء جميع الحقول المطلوبة');
        console.warn('⚠️ بيانات غير كاملة');
        return;
    }
    
    // Validate phone number
    if (!/^[0-9+\-\s()]+$/.test(citizenData.phone)) {
        alert('❌ رقم الهاتف غير صحيح');
        return;
    }
    
    // Check if citizen ID already exists
    citizensRef.orderByChild('id').equalTo(citizenData.id).once('value', snapshot => {
        if (snapshot.exists()) {
            alert('❌ رقم الهوية موجود بالفعل في النظام');
            console.warn('⚠️ رقم الهوية موجود:', citizenData.id);
            return;
        }
        
        // Add citizen to database
        citizensRef.push(citizenData, error => {
            if (error) {
                alert('❌ خطأ في حفظ البيانات:\n' + error.message);
                console.error('❌ خطأ Firebase:', error);
            } else {
                alert('✅ تم حفظ بيانات المواطن بنجاح!');
                console.log('✅ تم إضافة المواطن برقم هوية:', citizenData.id);
                
                // Reset form
                document.getElementById('newCitizenName').value = '';
                document.getElementById('newCitizenAge').value = '';
                document.getElementById('newCitizenBirthDate').value = '';
                document.getElementById('newCitizenID').value = '';
                document.getElementById('newCitizenJob').value = '';
                document.getElementById('newCitizenPhone').value = '';
                document.getElementById('newCitizenAddress').value = '';
                
                updateLastModified();
                loadAllRecords();
            }
        });
    }).catch(error => {
        console.error('❌ خطأ في التحقق:', error);
        alert('❌ خطأ في التحقق من البيانات');
    });
}

// ========== Add New Vehicle ==========
function addVehicle(event) {
    event.preventDefault();
    
    const ownerId = document.getElementById('newVehicleOwnerID').value.trim();
    const plate = document.getElementById('newVehiclePlate').value.trim().toUpperCase();
    
    const vehicleData = {
        plate: plate,
        type: document.getElementById('newVehicleType').value.trim(),
        color: document.getElementById('newVehicleColor').value.trim(),
        year: parseInt(document.getElementById('newVehicleYear').value),
        status: document.getElementById('newVehicleStatus').value,
        ownerId: ownerId,
        createdAt: new Date().toISOString()
    };
    
    console.log('🚗 جاري إضافة سيارة جديدة:', plate);
    
    // Validate data
    if (!plate || !vehicleData.type || !ownerId || !vehicleData.status) {
        alert('❌ الرجاء ملء جميع الحقول المطلوبة');
        console.warn('⚠️ بيانات السيارة غير كاملة');
        return;
    }
    
  // Validate plate format
if (!plate) {
    alert('❌ أدخل لوحة السيارة');
    return;
}
    
    // Check if citizen exists
    citizensRef.orderByChild('id').equalTo(ownerId).once('value', snapshot => {
        if (!snapshot.exists()) {
            alert('❌ لم يتم العثور على مواطن برقم الهوية هذا');
            console.warn('⚠️ رقم الهوية غير موجود:', ownerId);
            return;
        }
        
        // Check if plate already exists
        vehiclesRef.orderByChild('plate').equalTo(plate).once('value', plateSnapshot => {
            if (plateSnapshot.exists()) {
                alert('❌ لوحة السيارة موجودة بالفعل في النظام');
                console.warn('⚠️ لوحة السيارة موجودة:', plate);
                return;
            }
            
            // Add vehicle to database
            vehiclesRef.push(vehicleData, error => {
                if (error) {
                    alert('❌ خطأ في حفظ بيانات السيارة:\n' + error.message);
                    console.error('❌ خطأ Firebase:', error);
                } else {
                    alert('✅ تم حفظ بيانات السيارة بنجاح!');
                    console.log('✅ تم إضافة السيارة برقم لوحة:', plate);
                    
                    // Reset form
                    document.getElementById('newVehiclePlate').value = '';
                    document.getElementById('newVehicleType').value = '';
                    document.getElementById('newVehicleColor').value = '';
                    document.getElementById('newVehicleYear').value = '';
                    document.getElementById('newVehicleOwnerID').value = '';
                    document.getElementById('newVehicleStatus').value = '';
                    
                    updateLastModified();
                    loadAllRecords();
                }
            });
        }).catch(error => {
            console.error('❌ خطأ في التحقق من اللوحة:', error);
        });
    }).catch(error => {
        console.error('❌ خطأ في التحقق من المواطن:', error);
    });
}

// ========== Load All Records ==========
function loadAllRecords() {
    console.log('📋 جاري تحميل جميع السجلات...');
    
    citizensRef.once('value', snapshot => {
        if (!snapshot.exists()) {
            console.log('⚠️ لا توجد بيانات في قاعدة البيانات');
            document.getElementById('recordsTableBody').innerHTML = 
                '<tr><td colspan="5" style="text-align: center; color: #999;">لا توجد سجلات</td></tr>';
            return;
        }
        
        const citizens = snapshot.val();
        let tableHTML = '';
        let recordCount = 0;
        
        Object.entries(citizens).forEach(([citizenKey, citizen]) => {
            // Get vehicle for this citizen
            vehiclesRef.orderByChild('ownerId').equalTo(citizen.id).once('value', vehicleSnapshot => {
                if (vehicleSnapshot.exists()) {
                    const vehicles = vehicleSnapshot.val();
                    const vehicle = Object.values(vehicles)[0];
                    
                    tableHTML += `
                        <tr>
                            <td>${citizen.name}</td>
                            <td>${citizen.id}</td>
                            <td>${vehicle.plate}</td>
                            <td>0</td>
                            <td><button class="edit-btn" onclick="editRecord('${citizen.id}')">📝 تعديل</button></td>
                        </tr>
                    `;
                    
                    recordCount++;
                    document.getElementById('recordsTableBody').innerHTML = tableHTML;
                }
            });
        });
        
        console.log('✅ تم تحميل السجلات:', Object.keys(citizens).length);
    }).catch(error => {
        console.error('❌ خطأ في تحميل السجلات:', error);
        alert('❌ خطأ في تحميل البيانات');
    });
}

// ========== Search Records ==========
function searchRecords() {
    const searchTerm = document.getElementById('recordsSearchInput').value.trim();
    
    if (!searchTerm) {
        loadAllRecords();
        return;
    }
    
    console.log('🔍 جاري البحث عن السجلات:', searchTerm);
    
    let found = false;
    
    // Search by ID
    citizensRef.orderByChild('id').equalTo(searchTerm).once('value', snapshot => {
        if (snapshot.exists()) {
            found = true;
            const citizens = snapshot.val();
            let tableHTML = '';
            
            Object.entries(citizens).forEach(([key, citizen]) => {
                vehiclesRef.orderByChild('ownerId').equalTo(citizen.id).once('value', vehicleSnapshot => {
                    if (vehicleSnapshot.exists()) {
                        const vehicles = vehicleSnapshot.val();
                        const vehicle = Object.values(vehicles)[0];
                        
                        tableHTML += `
                            <tr>
                                <td>${citizen.name}</td>
                                <td>${citizen.id}</td>
                                <td>${vehicle.plate}</td>
                                <td>0</td>
                                <td><button class="edit-btn" onclick="editRecord('${citizen.id}')">📝 تعديل</button></td>
                            </tr>
                        `;
                        
                        document.getElementById('recordsTableBody').innerHTML = tableHTML;
                    }
                });
            });
        } else {
            // Search by plate
            vehiclesRef.orderByChild('plate').equalTo(searchTerm.toUpperCase()).once('value', vehicleSnapshot => {
                if (vehicleSnapshot.exists()) {
                    found = true;
                    const vehicles = vehicleSnapshot.val();
                    let tableHTML = '';
                    
                    Object.values(vehicles).forEach(vehicle => {
                        citizensRef.orderByChild('id').equalTo(vehicle.ownerId).once('value', citizenSnapshot => {
                            if (citizenSnapshot.exists()) {
                                const citizen = Object.values(citizenSnapshot.val())[0];
                                
                                tableHTML += `
                                    <tr>
                                        <td>${citizen.name}</td>
                                        <td>${citizen.id}</td>
                                        <td>${vehicle.plate}</td>
                                        <td>0</td>
                                        <td><button class="edit-btn" onclick="editRecord('${citizen.id}')">📝 تعديل</button></td>
                                    </tr>
                                `;
                                
                                document.getElementById('recordsTableBody').innerHTML = tableHTML;
                            }
                        });
                    });
                } else {
                    if (!found) {
                        console.warn('⚠️ لم يتم العثور على نتائج البحث');
                        document.getElementById('recordsTableBody').innerHTML = 
                            '<tr><td colspan="5" style="text-align: center;">❌ لم يتم العثور على نتائج</td></tr>';
                    }
                }
            });
        }
    }).catch(error => {
        console.error('❌ خطأ في البحث:', error);
    });
}

// ========== Edit Record ==========
function editRecord(citizenId) {
    console.log('✏️ محاولة تعديل السجل:', citizenId);
    
    // Find citizen data
    citizensRef.orderByChild('id').equalTo(citizenId).once('value', snapshot => {
        if (snapshot.exists()) {
            const citizen = Object.values(snapshot.val())[0];
            
            // Find vehicle data
            vehiclesRef.orderByChild('ownerId').equalTo(citizenId).once('value', vehicleSnapshot => {
                if (vehicleSnapshot.exists()) {
                    const vehicle = Object.values(vehicleSnapshot.val())[0];
                    
                    // Create edit form (مؤقتاً)
                    const editInfo = `
📋 بيانات المواطن:
الاسم: ${citizen.name}
العمر: ${citizen.age}
رقم الهوية: ${citizen.id}
الهاتف: ${citizen.phone}

🚗 بيانات السيارة:
اللوحة: ${vehicle.plate}
النوع: ${vehicle.type}
الحالة: ${vehicle.status}

⏳ ملاحظة: ميزة التعديل قيد التطوير
سيتم إضافتها قريباً`;
                    
                    alert(editInfo);
                }
            });
        }
    });
}

// ========== Update Last Modified ==========
function updateLastModified() {
    const now = new Date().toLocaleString('ar-SA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('lastUpdate').textContent = now;
    console.log('🕐 تم تحديث الوقت:', now);
}

// ========== Logout ==========
function logout() {
    if (confirm('🚪 هل أنت متأكد من تسجيل الخروج؟')) {
        console.log('👋 تسجيل خروج الضابط');
        alert('👋 وداعاً!');
        // window.location.href = 'login.html';
    }
}

// ========== Keyboard Shortcuts ==========
document.addEventListener('keypress', function(event) {
    // Ctrl + F للبحث السريع
    if (event.ctrlKey && event.key === 'f') {
        event.preventDefault();
        document.getElementById('searchInput').focus();
        console.log('🔍 تفعيل البحث السريع');
    }
    
    // Enter للبحث
    if (event.key === 'Enter' && document.getElementById('searchInput') === document.activeElement) {
        searchByPlate();
    }
});

// ========== Console Welcome Message ==========
console.log('%c🚔 Police Data System', 'font-size: 20px; color: #4a90e2; font-weight: bold;');
console.log('%cنظام قاعدة بيانات الشرطة المتكامل', 'font-size: 14px; color: #1e3a5f;');
console.log('%c✅ النظام جاهز للعمل', 'font-size: 12px; color: #27ae60;');
console.log('%cVersion 1.0.0 | 2026', 'font-size: 11px; color: #999;');