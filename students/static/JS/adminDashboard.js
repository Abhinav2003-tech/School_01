/* Shanti Niketan Public School — frontend-only dashboard interactions.
   No Django views, API calls, or database operations are used here.
   The Admissions section is intentionally left to its existing code. */
$(function () {
    "use strict";

    const STORAGE_KEY = "snps_super_admin_frontend_demo_v1";
    const sectionTitles = {
        students: "Students", teachers: "Teachers", classes: "Classes",
        attendance: "Attendance", fees: "Fees Management", results: "Exams & Results",
        notices: "Notices", events: "Events", gallery: "Gallery",
        enquiries: "Enquiries", reports: "Reports", settings: "Settings"
    };
    const schemas = {
        students: [
            { name: "name", label: "Student name", required: true },
            { name: "studentClass", label: "Class / Section", required: true },
            { name: "roll", label: "Roll number", required: true },
            { name: "phone", label: "Parent / guardian phone", type: "tel", required: true },
            { name: "status", label: "Status", type: "select", options: ["Active", "Pending", "Inactive"], required: true }
        ],
        teachers: [
            { name: "name", label: "Teacher name", required: true },
            { name: "subject", label: "Subject", required: true },
            { name: "phone", label: "Phone number", type: "tel" },
            { name: "email", label: "Email", type: "email" },
            { name: "status", label: "Status", type: "select", options: ["Active", "On Leave", "Inactive"], required: true }
        ],
        classes: [
            { name: "className", label: "Class name", required: true },
            { name: "section", label: "Section", required: true },
            { name: "teacher", label: "Class teacher" },
            { name: "room", label: "Room number" },
            { name: "students", label: "Number of students", type: "number", min: 0, required: true }
        ],
        attendance: [
            { name: "className", label: "Class / Section", required: true },
            { name: "date", label: "Date", type: "date", required: true },
            { name: "total", label: "Total students", type: "number", min: 1, required: true },
            { name: "present", label: "Present students", type: "number", min: 0, required: true }
        ],
        fees: [
            { name: "receipt", label: "Receipt number", required: true },
            { name: "student", label: "Student name", required: true },
            { name: "studentClass", label: "Class", required: true },
            { name: "amount", label: "Amount (₹)", type: "number", min: 0, required: true },
            { name: "date", label: "Payment date", type: "date", required: true },
            { name: "status", label: "Payment status", type: "select", options: ["Paid", "Pending", "Partial"], required: true }
        ],
        results: [
            { name: "examName", label: "Examination name", required: true },
            { name: "className", label: "Class / Section", required: true },
            { name: "examDate", label: "Examination date", type: "date", required: true },
            { name: "average", label: "Average score (%)", type: "number", min: 0, max: 100, required: true },
            { name: "status", label: "Status", type: "select", options: ["Scheduled", "Completed"], required: true }
        ],
        notices: [
            { name: "title", label: "Notice title", required: true },
            { name: "category", label: "Category", type: "select", options: ["General", "Academic", "Examination", "Holiday", "Event"], required: true },
            { name: "date", label: "Publish date", type: "date", required: true },
            { name: "audience", label: "Audience", type: "select", options: ["All Students", "Parents", "Teachers", "Staff", "All"], required: true },
            { name: "status", label: "Status", type: "select", options: ["Published", "Draft"], required: true },
            { name: "description", label: "Notice details", type: "textarea", full: true }
        ],
        events: [
            { name: "title", label: "Event name", required: true },
            { name: "date", label: "Event date", type: "date", required: true },
            { name: "time", label: "Time" },
            { name: "venue", label: "Venue" },
            { name: "description", label: "Description", type: "textarea", full: true }
        ],
        gallery: [
            { name: "title", label: "Photo / album title", required: true },
            { name: "imageUrl", label: "Image URL (optional)", type: "url" },
            { name: "date", label: "Date", type: "date" },
            { name: "description", label: "Description", type: "textarea", full: true }
        ]
    };

    let editing = null;
    let records = loadRecords();

    function loadRecords() {
        try {
            const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
            return parsed && typeof parsed === "object" ? parsed : {};
        } catch (error) {
            return {};
        }
    }

    function saveRecords() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
            return true;
        } catch (error) {
            toast("Browser storage is unavailable. This change may not persist after refresh.", "error");
            return false;
        }
    }

    function list(section) {
        if (!Array.isArray(records[section])) records[section] = [];
        return records[section];
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
            return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch];
        });
    }

    function toast(message, type) {
        let $toast = $("#frontendToast");
        if (!$toast.length) {
            $toast = $('<div id="frontendToast" role="status" aria-live="polite"></div>').appendTo("body");
        }
        $toast.removeClass("success error").addClass(type || "");
        $toast.text(message).stop(true, true).fadeIn(160);
        window.clearTimeout($toast.data("hideTimer"));
        $toast.data("hideTimer", window.setTimeout(function () { $toast.fadeOut(250); }, 2800));
    }

    function today() {
        const d = new Date();
        return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    }

    function ensureModal() {
        if ($("#frontendModalBackdrop").length) return;
        $("body").append(
            '<div class="frontend-modal-backdrop" id="frontendModalBackdrop" role="dialog" aria-modal="true" aria-labelledby="frontendModalTitle">' +
            '<div class="frontend-modal">' +
            '<div class="frontend-modal-header"><h3 id="frontendModalTitle">Add record</h3><button type="button" class="frontend-modal-close" aria-label="Close">&times;</button></div>' +
            '<form class="frontend-form" id="frontendRecordForm"><div class="frontend-form-grid" id="frontendFormFields"></div>' +
            '<div class="frontend-modal-actions"><button type="button" class="frontend-btn modal-cancel">Cancel</button><button type="submit" class="frontend-btn primary">Save record</button></div>' +
            '</form>' +
            '</div>' +
            '</div>'
        );
    }

    function openForm(section, recordId, extraFields) {
        if (section === "admissions") return;
        ensureModal();
        const schema = schemas[section];
        if (!schema) {
            toast("This action is not available for this section.", "error");
            return;
        }
        const existing = recordId ? list(section).find(function (r) { return r.id === recordId; }) : null;
        editing = { section: section, id: recordId || null };
        $("#frontendRecordForm .frontend-modal-actions").html('<button type="button" class="frontend-btn modal-cancel">Cancel</button><button type="submit" class="frontend-btn primary">Save record</button>');
        $("#frontendModalTitle").text((existing ? "Edit " : "Add ") + (sectionTitles[section] || "Record").replace(/s$/, ""));
        const $fields = $("#frontendFormFields").empty();

        schema.forEach(function (field) {
            const value = existing && existing[field.name] != null ? existing[field.name] : (field.name === "date" ? today() : "");
            const id = "frontend-" + field.name;
            let control = "";
            if (field.type === "select") {
                control = '<select id="' + id + '" name="' + field.name + '"' + (field.required ? " required" : "") + '><option value="">Select</option>' +
                    field.options.map(function (option) {
                        return '<option value="' + escapeHtml(option) + '"' + (String(value) === option ? " selected" : "") + '>' + escapeHtml(option) + '</option>';
                    }).join("") + '</select>';
            } else if (field.type === "textarea") {
                control = '<textarea id="' + id + '" name="' + field.name + '"' + (field.required ? " required" : "") + '>' + escapeHtml(value) + '</textarea>';
            } else {
                control = '<input id="' + id + '" name="' + field.name + '" type="' + (field.type || "text") + '"' +
                    (field.min != null ? ' min="' + field.min + '"' : "") +
                    (field.max != null ? ' max="' + field.max + '"' : "") +
                    (field.required ? " required" : "") +
                    ' value="' + escapeHtml(value) + '">';
            }
            $fields.append('<div class="frontend-field' + (field.full ? " full" : "") + '"><label for="' + id + '">' + escapeHtml(field.label) + (field.required ? " *" : "") + '</label>' + control + '</div>');
        });

        if (section === "attendance") {
            const presentField = $fields.find('[name="present"]');
            presentField.attr("max", $fields.find('[name="total"]').val() || "");
        }
        $("#frontendModalBackdrop").addClass("show");
        $("#frontendFormFields").find("input,select,textarea").first().trigger("focus");
    }

    function closeForm() {
        $("#frontendModalBackdrop").removeClass("show");
        $("#frontendRecordForm")[0] && $("#frontendRecordForm")[0].reset();
        editing = null;
    }

    function actionButtons(section, id) {
        return '<div class="frontend-record-actions"><button type="button" data-record-action="edit" data-record-section="' + section + '" data-record-id="' + id + '">Edit</button>' +
            '<button type="button" class="frontend-row-action delete" data-record-action="delete" data-record-section="' + section + '" data-record-id="' + id + '">Delete</button></div>';
    }

    function addActionColumn(section) {
        if (section === "notices") return; // The notice table already has its own Action column.
        const $table = $("#" + ({ students: "studentTable", attendance: "attendanceTable", fees: "feeTable" }[section] || ""));
        if (!$table.length) return;
        const $headRow = $table.find("thead tr").first();
        if (!$headRow.find(".frontend-actions-head").length) {
            $headRow.append('<th class="frontend-actions-head">Actions</th>');
            $table.find("tbody tr").each(function () {
                const $row = $(this);
                if ($row.find(".frontend-actions-cell").length) return;
                const rowId = "static-" + section + "-" + $row.index();
                $row.append('<td class="frontend-actions-cell"><button type="button" class="frontend-row-action" data-static-action="view" data-section="' + section + '" data-row="' + $row.index() + '">View</button>' +
                    (section === "students" || section === "fees" || section === "notices" ? ' <button type="button" class="frontend-row-action delete" data-static-action="delete" data-section="' + section + '" data-row="' + $row.index() + '">Remove</button>' : "") + '</td>');
            });
        }
    }

    function renderTableRecord(section, record) {
        const tableId = { students: "studentTable", attendance: "attendanceTable", fees: "feeTable", notices: "noticeTable" }[section];
        if (!tableId) return;
        const $table = $("#" + tableId);
        if (!$table.length) return;
        const $body = $table.find("tbody");
        let cells = [];
        if (section === "students") {
            cells = [record.studentId, record.name, record.studentClass, record.roll, record.phone, record.status];
        } else if (section === "attendance") {
            const total = Number(record.total || 0), present = Number(record.present || 0);
            cells = [record.className + " (" + record.date + ")", total, present, Math.max(0, total - present), total ? (present / total * 100).toFixed(1) + "%" : "0%"];
        } else if (section === "fees") {
            cells = [record.receipt, record.student, record.studentClass, "₹" + Number(record.amount || 0).toLocaleString("en-IN"), record.date, record.status];
        } else if (section === "notices") {
            cells = [record.title, record.category, record.date, record.audience, record.status, ""];
        }
        let $row = $body.find('[data-demo-record-id="' + record.id + '"]');
        if (!$row.length) $row = $('<tr data-demo-record-id="' + escapeHtml(record.id) + '"></tr>').appendTo($body);
        $row.empty();
        cells.forEach(function (cell, i) {
            if (section === "notices" && i === 5) {
                $row.append('<td><span class="frontend-actions-cell">' + actionButtons(section, record.id) + '</span></td>');
            } else {
                let safe = escapeHtml(cell);
                if (i === cells.length - 1 && section === "students") {
                    const klass = String(cell).toLowerCase() === "active" ? "active" : "pending";
                    safe = '<span class="badge-status ' + klass + '">' + escapeHtml(cell) + '</span>';
                }
                if (i === cells.length - 1 && section === "fees") {
                    safe = '<span class="badge-status ' + (String(cell).toLowerCase() === "paid" ? "active" : "pending") + '">' + escapeHtml(cell) + '</span>';
                }
                $row.append("<td>" + safe + "</td>");
            }
        });
        if (section !== "notices") {
            $row.append('<td class="frontend-actions-cell">' + actionButtons(section, record.id) + '</td>');
        }
    }

    function renderCardRecord(section, record) {
        let $container = $("#section-" + section + " .frontend-records");
        if (!$container.length) {
            $container = $('<div class="frontend-records" aria-live="polite"></div>');
            const $top = $("#section-" + section + " .section-top").first();
            if ($top.length) $top.after($container);
            else $("#section-" + section).append($container);
        }
        let title = record.name || record.className || record.examName || record.title || "Record";
        let details = [];
        Object.keys(record).forEach(function (key) {
            if (["id", "section", "name", "className", "examName", "title", "imageUrl"].includes(key)) return;
            if (record[key] !== "" && record[key] != null) {
                const label = key.replace(/([A-Z])/g, " $1").replace(/^./, function (c) { return c.toUpperCase(); });
                details.push("<p><strong>" + escapeHtml(label) + ":</strong> " + escapeHtml(record[key]) + "</p>");
            }
        });
        let media = "";
        if (section === "gallery" && record.imageUrl) {
            media = '<img src="' + escapeHtml(record.imageUrl) + '" alt="' + escapeHtml(title) + '" style="width:100%;height:145px;object-fit:cover;border-radius:7px;margin-bottom:10px" onerror="this.style.display=\'none\'">';
        }
        let $card = $container.find('[data-demo-record-id="' + record.id + '"]');
        if (!$card.length) $card = $('<article class="frontend-record-card" data-demo-record-id="' + escapeHtml(record.id) + '"></article>').appendTo($container);
        $card.html(media + "<h4>" + escapeHtml(title) + "</h4>" + details.join("") + actionButtons(section, record.id));
    }

    function renderAll() {
        ["students", "attendance", "fees", "notices"].forEach(addActionColumn);
        Object.keys(schemas).forEach(function (section) {
            list(section).forEach(function (record) {
                if (["students", "attendance", "fees", "notices"].includes(section)) renderTableRecord(section, record);
                else renderCardRecord(section, record);
            });
        });
        updateStudentCounts();
    }

    function updateStudentCounts() {
        const demoCount = list("students").length;
        const $studentSection = $("#section-students");
        if ($studentSection.length && demoCount) {
            const $total = $studentSection.find(".stats-grid .stat-card").eq(0).find("strong");
            const $active = $studentSection.find(".stats-grid .stat-card").eq(1).find("strong");
            const $pending = $studentSection.find(".stats-grid .stat-card").eq(2).find("strong");
            if ($total.length) $total.text((1524 + demoCount).toLocaleString("en-IN"));
            if ($active.length) $active.text((1480 + list("students").filter(function (r) { return r.status === "Active"; }).length).toLocaleString("en-IN"));
            if ($pending.length) $pending.text((44 + list("students").filter(function (r) { return r.status === "Pending"; }).length).toLocaleString("en-IN"));
        }
    }

    function addRecord(section, values) {
        const record = Object.assign({ id: section + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7), section: section }, values);
        if (section === "students") record.studentId = "DEMO-" + String(Date.now()).slice(-6);
        if (section === "attendance") {
            const total = Number(record.total), present = Number(record.present);
            if (present > total) {
                toast("Present students cannot exceed total students.", "error");
                return false;
            }
        }
        list(section).push(record);
        saveRecords();
        if (["students", "attendance", "fees", "notices"].includes(section)) renderTableRecord(section, record);
        else renderCardRecord(section, record);
        updateStudentCounts();
        return true;
    }

    function updateRecord(section, id, values) {
        const index = list(section).findIndex(function (r) { return r.id === id; });
        if (index < 0) return false;
        const updated = Object.assign({}, list(section)[index], values);
        if (section === "attendance" && Number(updated.present) > Number(updated.total)) {
            toast("Present students cannot exceed total students.", "error");
            return false;
        }
        list(section)[index] = updated;
        saveRecords();
        if (["students", "attendance", "fees", "notices"].includes(section)) renderTableRecord(section, updated);
        else renderCardRecord(section, updated);
        updateStudentCounts();
        return true;
    }

    function deleteRecord(section, id) {
        if (!confirm("Delete this frontend demo record?")) return;
        records[section] = list(section).filter(function (r) { return r.id !== id; });
        saveRecords();
        $('[data-demo-record-id="' + id + '"]').remove();
        updateStudentCounts();
        toast("Demo record deleted.", "success");
    }

    function formValues($form) {
        const values = {};
        $form.serializeArray().forEach(function (item) { values[item.name] = item.value.trim(); });
        return values;
    }

    function sectionForButton($button) {
        const text = $button.text().replace(/\s+/g, " ").trim().toLowerCase();
        const section = $button.closest(".dashboard-section").attr("id");
        if (section === "section-students" || text.includes("add student")) return "students";
        if (section === "section-teachers" || text.includes("add teacher")) return "teachers";
        if (section === "section-results" || text.includes("examination")) return "results";
        if (section === "section-classes" || text.includes("add class") || text === "manage") return "classes";
        if (section === "section-attendance" || text.includes("mark attendance")) return "attendance";
        if (section === "section-fees" || text.includes("record payment") || text.includes("fee record")) return "fees";
        if (section === "section-notices" || text.includes("notice")) return "notices";
        if (section === "section-events" || text.includes("event")) return "events";
        if (section === "section-gallery" || text.includes("photos")) return "gallery";
        return null;
    }

    /* Add/edit forms for non-admission sections */
    $(document).on("click", ".primary-action, .quick-actions button, .management-card button, .report-card button", function (e) {
        const $button = $(this);
        const text = $button.text().replace(/\s+/g, " ").trim().toLowerCase();
        if ($button.closest("#section-admissions").length) return;
        if ($button.is(".quick-actions button") && ["reports"].includes($button.attr("data-section"))) return;
        if ($button.is(".quick-actions button") && $button.attr("data-section") && !/add student|add teacher|new notice|add event|fee record/i.test(text)) return;
        if (text.includes("save changes")) {
            e.preventDefault();
            toast("Settings saved in this browser demo only.", "success");
            return;
        }
        if (text.includes("export") || text.includes("generate")) {
            e.preventDefault();
            const reportName = $button.closest(".report-card").find("h3,h4").first().text().trim() || "school_report";
            downloadCSV(reportName, collectVisibleRows());
            return;
        }
        if (text.includes("view result")) {
            e.preventDefault();
            toast("Results section is ready for frontend demo records.", "success");
            return;
        }
        if (text.includes("view teacher") || text.includes("view leave")) {
            e.preventDefault();
            toast(text.includes("leave") ? "Leave records are demo-only; no backend is connected." : "Teacher records are shown below when added.", "success");
            return;
        }
        const section = sectionForButton($button);
        if (section && schemas[section]) {
            e.preventDefault();
            openForm(section);
        } else if (text.includes("attendance")) {
            e.preventDefault();
            toast("Open Attendance from the sidebar to mark a demo attendance record.", "success");
        } else if (text === "manage" && $button.closest("#section-results").length) {
            e.preventDefault();
            openForm("results");
        } else if (text === "view list" && $button.closest("#section-results").length) {
            e.preventDefault();
            toast("Add an examination first to build your frontend results list.", "success");
        } else if (text === "read" || text === "view") {
            e.preventDefault();
            const rowText = $button.closest("tr").children().not(":last").text().replace(/\s+/g, " ").trim();
            showInfo(text === "read" ? "Enquiry details" : "Record details", rowText || "No additional details available.");
        }
    });

    function showInfo(title, content) {
        ensureModal();
        editing = null;
        $("#frontendModalTitle").text(title);
        $("#frontendFormFields").html('<div class="frontend-field full"><p style="font-size:13px;color:#475569;white-space:pre-wrap">' + escapeHtml(content) + '</p></div>');
        $("#frontendRecordForm .frontend-modal-actions").html('<button type="button" class="frontend-btn primary modal-cancel">Close</button>');
        $("#frontendModalBackdrop").addClass("show");
    }

    $(document).on("click", ".row-btn", function (e) {
        const $button = $(this);
        if ($button.closest("#section-admissions").length) return;
        const text = $button.text().trim().toLowerCase();
        const $row = $button.closest("tr");
        if (text === "edit" && $button.closest("#section-notices").length) {
            e.preventDefault();
            const title = $row.children().eq(0).text().trim();
            const found = list("notices").find(function (r) { return r.title === title; });
            if (found) openForm("notices", found.id);
            else toast("Only notices added in this frontend demo can be edited.", "error");
        } else if (text === "read" || text === "view") {
            e.preventDefault();
            showInfo(text === "read" ? "Enquiry details" : "Record details", $row.children().not(":last").text().replace(/\s+/g, " ").trim());
        }
    });

    $(document).on("click", "[data-record-action]", function () {
        const section = $(this).attr("data-record-section");
        const id = $(this).attr("data-record-id");
        if ($(this).attr("data-record-action") === "edit") openForm(section, id);
        else if ($(this).attr("data-record-action") === "delete") deleteRecord(section, id);
    });

    $(document).on("click", "[data-static-action]", function () {
        const section = $(this).attr("data-section");
        const $row = $(this).closest("tr");
        if ($(this).attr("data-static-action") === "view") {
            showInfo(sectionTitles[section] || "Record", $row.children().not(":last").text().replace(/\s+/g, " ").trim());
        } else {
            if (!confirm("Remove this sample row from the current page? This does not change any database record.")) return;
            $row.remove();
            toast("Sample row removed from this page. It may return when the page reloads.", "success");
        }
    });

    $(document).on("click", ".frontend-modal-close, .modal-cancel", closeForm);
    $("#frontendModalBackdrop").on("click", function (e) {
        if (e.target === this) closeForm();
    });
    $(document).on("keydown", function (e) {
        if (e.key === "Escape") closeForm();
    });

    $(document).on("input change", '#frontendFormFields [name="total"]', function () {
        const total = Number($(this).val());
        $('#frontendFormFields [name="present"]').attr("max", total || "");
    });

    $(document).on("submit", "#frontendRecordForm", function (e) {
        e.preventDefault();
        if (!editing || !schemas[editing.section]) return;
        const section = editing.section;
        const values = formValues($(this));
        if (section === "attendance" && Number(values.present) > Number(values.total)) {
            toast("Present students cannot exceed total students.", "error");
            return;
        }
        const wasEditing = Boolean(editing.id);
        const success = wasEditing ? updateRecord(section, editing.id, values) : addRecord(section, values);
        if (success) {
            closeForm();
            toast(wasEditing ? "Record updated." : "Record added to this browser demo.", "success");
        }
    });

    function collectVisibleRows() {
        const rows = [];
        const $active = $(".dashboard-section.active-section");
        const $table = $active.find("table").first();
        if ($table.length) {
            $table.find("thead tr").first().find("th").each(function () { rows.push([$(this).text().trim()]); });
            const headers = [];
            $table.find("thead th").each(function () { headers.push($(this).text().trim()); });
            const data = [headers];
            $table.find("tbody tr:visible").each(function () {
                const values = [];
                $(this).children("td").each(function () { values.push($(this).text().trim().replace(/\s+/g, " ")); });
                data.push(values);
            });
            return data;
        }
        return [["Section", "Record"], [sectionTitles[$active.attr("id").replace("section-", "")] || "Report", "Frontend demo export"]];
    }

    function downloadCSV(filename, data) {
        const csv = data.map(function (row) {
            return row.map(function (cell) { return '"' + String(cell == null ? "" : cell).replace(/"/g, '""') + '"'; }).join(",");
        }).join("\r\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename.toLowerCase().replace(/[^a-z0-9_-]+/g, "_") + ".csv";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        toast("CSV report downloaded.", "success");
    }

    /* Search only non-admission sections; admission filtering remains untouched. */
    $("#globalSearch").on("input", function () {
        const $active = $(".dashboard-section.active-section");
        if ($active.attr("id") === "section-admissions") return;
        const value = $(this).val().toLowerCase().trim();
        const $table = $active.find("table").first();
        if ($table.length) {
            $table.find("tbody tr").each(function () {
                $(this).toggle($(this).text().toLowerCase().includes(value));
            });
        } else {
            $active.find(".frontend-record-card").each(function () {
                $(this).toggle($(this).text().toLowerCase().includes(value));
            });
        }
    });

    /* Make the dashboard notification and date controls respond. */
    $(".icon-btn").on("click", function () { toast("You have 3 demo notifications.", "success"); });
    $(".date-btn").on("click", function () { toast("Dashboard date: " + new Date().toLocaleDateString(), "success"); });

    /* Keep profile, sidebar and section navigation as implemented in the page.
       Add demo cards/tables from saved browser records on initial load. */
    renderAll();
});

$(document).ready(function () {

    /* =====================================================
       SECTION NAVIGATION
    ====================================================== */

    function showSection(section) {

        if (!section) {
            return;
        }

        $(".dashboard-section")
            .removeClass("active-section");

        $("#section-" + section)
            .addClass("active-section");

        $(".menu-link")
            .removeClass("active");

        $('.menu-link[data-section="' + section + '"]')
            .addClass("active");

        const titleMap = {

            dashboard: "Dashboard",
            students: "Students",
            teachers: "Teachers",
            classes: "Classes",
            attendance: "Attendance",
            admissions: "Admission Applications",
            fees: "Fees Management",
            results: "Exams & Results",
            notices: "Notices",
            events: "Events",
            gallery: "Gallery",
            enquiries: "Enquiries",
            reports: "Reports",
            settings: "Settings"

        };

        $("#topTitle")
            .text(titleMap[section] || "Dashboard");

        if ($(window).width() <= 900) {

            $("#sidebar")
                .removeClass("mobile-open");

            $("#mobileOverlay")
                .removeClass("show");

        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    /* SIDEBAR MENU */

    /* SIDEBAR MENU */
    $(".menu-link[data-section]").on("click", function (e) {
        const href = $(this).attr("href");
        const section = $(this).attr("data-section");

        // Let Django open pages with real URLs.
        if (href && href !== "#") {
            return;
        }

        e.preventDefault();
        showSection(section);
    });

    /* PROFILE LINKS */
    $(".profile-section-link").on("click", function (e) {
        e.preventDefault();
        $("#profileMenu").removeClass("show");
        goToSection($(this).attr("data-section"));
    });


    /* QUICK ACTIONS */

    $(".quick-actions button").on("click", function () {

        const section =
            $(this).attr("data-section");

        showSection(section);

    });


    /* VIEW ALL */

    $(".view-all").on("click", function () {

        const section =
            $(this).attr("data-section");

        showSection(section);

    });


    /* PROFILE LINKS */

    $(".profile-section-link").on("click", function (e) {

        e.preventDefault();

        const section =
            $(this).attr("data-section");

        $("#profileMenu")
            .removeClass("show");

        showSection(section);

    });


    /* =====================================================
       PROFILE DROPDOWN
    ====================================================== */

    $("#profileBtn").on("click", function (e) {

        e.stopPropagation();

        $("#profileMenu")
            .toggleClass("show");

    });


    $(document).on("click", function () {

        $("#profileMenu")
            .removeClass("show");

    });


    /* =====================================================
       MOBILE SIDEBAR
    ====================================================== */

    $("#sidebarToggle").on("click", function () {

        $("#sidebar")
            .toggleClass("mobile-open");

        $("#mobileOverlay")
            .toggleClass("show");

    });


    $("#mobileOverlay").on("click", function () {

        $("#sidebar")
            .removeClass("mobile-open");

        $(this)
            .removeClass("show");

    });


    /* =====================================================
       LOCAL TABLE SEARCH
    ====================================================== */

    $(".local-search").on("keyup", function () {

        const value =
            $(this).val().toLowerCase();

        const target =
            $(this).attr("data-target");

        $(target + " tbody tr").each(function () {

            const rowText =
                $(this).text().toLowerCase();

            $(this).toggle(
                rowText.indexOf(value) > -1
            );

        });

    });


    /* =====================================================
       ADMISSION SEARCH
    ====================================================== */
    function filterApplications() {

        const search =
            $("#applicationSearch")
                .val()
                .toLowerCase()
                .trim();

        const status =
            $("#applicationStatusFilter")
                .val();

        $("#applicationsTable tbody tr")
            .each(function () {

                const row =
                    $(this);

                const student =
                    row.attr("data-student")
                    || "";

                const father =
                    row.attr("data-father")
                    || "";

                const mobile =
                    row.attr("data-mobile")
                    || "";

                const rowStatus =
                    row.attr("data-status")
                    || "";

                const matchesSearch =

                    student
                        .toLowerCase()
                        .includes(search)

                    ||

                    father
                        .toLowerCase()
                        .includes(search)

                    ||

                    mobile
                        .toLowerCase()
                        .includes(search);

                const matchesStatus =

                    status === "all"
                    ||
                    rowStatus === status;

                if (
                    matchesSearch
                    &&
                    matchesStatus
                ) {

                    row.show();

                } else {

                    row.hide();

                }

            });

    }


    $("#applicationSearch")
        .on("keyup", filterApplications);


    $("#applicationStatusFilter")
        .on("change", filterApplications);


    /* =====================================================
       ADMISSION MODAL
    ====================================================== */

    $(".view-btn").on("click", function () {

        const btn =
            $(this);

        $("#modalApplicationId")
            .text(btn.data("id"));

        $("#modalFirstName")
            .text(btn.data("first"));

        $("#modalMiddleName")
            .text(btn.data("middle") || "-");

        $("#modalLastName")
            .text(btn.data("last"));

        $("#modalDOB")
            .text(btn.data("dob"));

        $("#modalGender")
            .text(btn.data("gender"));

        $("#modalBlood")
            .text(btn.data("blood"));

        $("#modalClass")
            .text(btn.data("class"));

        $("#modalYear")
            .text(btn.data("year"));

        $("#modalPreviousSchool")
            .text(btn.data("previous-school"));

        $("#modalPreviousClass")
            .text(btn.data("previous-class"));

        $("#modalFather")
            .text(btn.data("father"));

        $("#modalMother")
            .text(btn.data("mother"));

        $("#modalGuardian")
            .text(btn.data("guardian") || "-");

        $("#modalRelationship")
            .text(btn.data("relationship"));

        $("#modalMobile")
            .text(btn.data("mobile"));

        $("#modalEmail")
            .text(btn.data("email"));

        $("#modalAddress")
            .text(btn.data("address"));

        $("#modalCity")
            .text(btn.data("city"));

        $("#modalState")
            .text(btn.data("state"));

        $("#modalPin")
            .text(btn.data("pin"));

        $("#modalNationality")
            .text(btn.data("nationality"));

        $("#modalReligion")
            .text(btn.data("religion"));

        $("#modalDisability")
            .text(btn.data("disability"));

        $("#modalSpecial")
            .text(btn.data("special"));

        $("#modalStatus")
            .val(btn.data("status"));

    });


    /* =====================================================
       TOAST
    ====================================================== */

    function showToast(message, type) {

        const toast =
            $("#toastMessage");

        toast.find("span")
            .text(message);

        toast.removeClass(
            "toast-success toast-error"
        );

        if (type === "error") {

            toast.addClass("toast-error");

        } else {

            toast.addClass("toast-success");

        }

        toast.addClass("show");

        setTimeout(function () {

            toast.removeClass("show");

        }, 2500);

    }


    /* =====================================================
       APPROVE APPLICATION
    ====================================================== */

    $("#approveApplication").on("click", function () {

        const id =
            $("#modalApplicationId").text();

        const row =
            $("#applicationsTable tbody tr")
                .filter(function () {

                    return $(this)
                        .find(".application-id")
                        .text()
                        .trim() === id;

                });

        if (row.length) {

            row.attr(
                "data-status",
                "Approved"
            );

            row.find(".application-badge")
                .removeClass(
                    "pending-badge rejected-badge"
                )
                .addClass(
                    "approved-badge"
                )
                .text("Approved");

            $("#modalStatus")
                .val("Approved");

            updateAdmissionStats();

            showToast(
                "Application approved successfully.",
                "success"
            );

        }

    });


    /* =====================================================
       REJECT APPLICATION
    ====================================================== */

    $("#rejectApplication").on("click", function () {

        const id =
            $("#modalApplicationId").text();

        const row =
            $("#applicationsTable tbody tr")
                .filter(function () {

                    return $(this)
                        .find(".application-id")
                        .text()
                        .trim() === id;

                });

        if (row.length) {

            row.attr(
                "data-status",
                "Rejected"
            );

            row.find(".application-badge")
                .removeClass(
                    "pending-badge approved-badge"
                )
                .addClass(
                    "rejected-badge"
                )
                .text("Rejected");

            $("#modalStatus")
                .val("Rejected");

            updateAdmissionStats();

            showToast(
                "Application rejected.",
                "error"
            );

        }

    });


    /* =====================================================
       UPDATE ADMISSION STATISTICS
    ====================================================== */

    function updateAdmissionStats() {

        let total = 0;
        let pending = 0;
        let approved = 0;
        let rejected = 0;

        $("#applicationsTable tbody tr")
            .each(function () {

                total++;

                const status =
                    $(this).attr("data-status");

                if (status === "Pending") {
                    pending++;
                }

                if (status === "Approved") {
                    approved++;
                }

                if (status === "Rejected") {
                    rejected++;
                }

            });

        $("#totalApplications")
            .text(total);

        $("#pendingApplications")
            .text(pending);

        $("#approvedApplications")
            .text(approved);

        $("#rejectedApplications")
            .text(rejected);

    }


    /* =====================================================
       EXPORT APPLICATIONS CSV
    ====================================================== */

    $("#exportApplications").on("click", function () {

        let csv = [];

        csv.push(
            [
                "Application ID",
                "Student Name",
                "Date of Birth",
                "Gender",
                "Class",
                "Academic Year",
                "Father Name",
                "Mobile",
                "Status"
            ].join(",")
        );


        $("#applicationsTable tbody tr:visible")
            .each(function () {

                const row =
                    $(this);

                const values = [

                    row.find(".application-id").text().trim(),

                    row.find(".student-name strong").text().trim(),

                    row.children("td").eq(2).text().trim(),

                    row.children("td").eq(3).text().trim(),

                    row.children("td").eq(4).text().trim(),

                    row.children("td").eq(5).text().trim(),

                    row.children("td").eq(6).text().trim(),

                    row.children("td").eq(7).text().trim(),

                    row.attr("data-status")

                ];

                csv.push(values.join(","));

            });


        const blob =
            new Blob(
                [csv.join("\n")],
                { type: "text/csv;charset=utf-8;" }
            );


        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            "admission_applications.csv";

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        showToast(
            "Applications exported successfully.",
            "success"
        );

    });


    /* =====================================================
       LOGOUT
    ====================================================== */

    $("#logoutBtn, #logoutBtn2").on("click", function (e) {

        e.preventDefault();

        const confirmLogout =
            confirm(
                "Are you sure you want to logout?"
            );

        if (confirmLogout) {

            showToast(
                "Logout successful.",
                "success"
            );

            /*
             * If Django logout URL is available,
             * replace the following with:
             *
             * window.location.href = "/logout/";
             */

        }

    });


    /* =====================================================
       GLOBAL SEARCH
    ====================================================== */

    $("#globalSearch").on("keyup", function () {

        const value =
            $(this)
                .val()
                .toLowerCase()
                .trim();

        if (!value) {
            return;
        }

        let found = false;

        $(".dashboard-section").each(function () {

            if (
                $(this)
                    .text()
                    .toLowerCase()
                    .includes(value)
            ) {

                found = true;

            }
        });
        if (!found) {
            showToast(
                "No matching content found.",
                "error"
            );
        }
    });
});

function showToast(message, type) {
    const toast = $("#toastMessage");
    toast.find("span").text(message);
    toast.removeClass("toast-success toast-error")
        .addClass(type === "error" ? "toast-error" : "toast-success")
        .addClass("show");
    setTimeout(function () { toast.removeClass("show"); }, 2500);
}

const STATUS_UI = {
    pending: { label: "Pending", cls: "pending-badge" },
    approved: { label: "Approved", cls: "approved-badge" },
    reject: { label: "Rejected", cls: "rejected-badge" }
};

function saveStatus(newStatus) {
    const id = $("#modalApplicationId").text().trim();

    $.ajax({
        url: window.location.href,
        type: "POST",
        headers: { "X-Requested-With": "XMLHttpRequest" },
        data: {
            application_id: id,
            status: newStatus,
            csrfmiddlewaretoken: $("#applicationModal [name=csrfmiddlewaretoken]").val()
        },
        success: function (res) {
            const ui = STATUS_UI[res.status];
            const row = $("#applicationsTable tbody tr").filter(function () {
                return $(this).find(".application-id").text().trim() === id;
            });

            row.attr("data-status", res.status);
            row.find(".application-badge")
                .removeClass("pending-badge approved-badge rejected-badge")
                .addClass(ui.cls)
                .text(ui.label);

            // attr (not .data) so the View button reads the new value next time
            row.find(".view-btn").attr("data-status", res.status);

            $("#modalStatus").val(res.status);
            updateAdmissionStats();
            showToast("Application " + ui.label.toLowerCase() + ".",
                res.status === "reject" ? "error" : "success");
        },
        error: function () {
            showToast("Could not save the status. Please try again.", "error");
        }
    });
}

$("#approveApplication").on("click", function () { saveStatus("approved"); });
$("#rejectApplication").on("click", function () { saveStatus("reject"); });

function updateAdmissionStats() {
    const rows = $("#applicationsTable tbody tr");
    $("#totalApplications").text(rows.length);
    $("#pendingApplications").text(rows.filter('[data-status="pending"]').length);
    $("#approvedApplications").text(rows.filter('[data-status="approved"]').length);
    $("#rejectedApplications").text(rows.filter('[data-status="reject"]').length);
}

updateAdmissionStats(); // replaces the hardcoded 4 / 2 / 1 / 1 on page load

/* =====================================================
   EDIT ADMISSION APPLICATION
===================================================== */
$(function () {

    // form field name  ->  data-* attribute on the View button
    const EDIT_FIELD_MAP = {
        firstname: "first",
        middlename: "middle",
        lastname: "last",
        date_of_birth: "dob",
        gender: "gender",
        blood_group: "blood",
        applying_for_class: "class",
        academic_year: "year",
        previous_school: "previous-school",
        previous_class: "previous-class",
        father_name: "father",
        mother_name: "mother",
        guardian_name: "guardian",
        relationship_with_student: "relationship",
        mobile_number: "mobile",
        email: "email",
        full_address: "address",
        city: "city",
        state: "state",
        pincode: "pin",
        nationality: "nationality",
        religion: "religion",
        any_disabilities: "disability",
        any_special_information: "special"
    };

    // Fill the form when the popup opens
    $("#editApplicationModal").on("show.bs.modal", function (event) {
        const src = $(event.relatedTarget).closest("tr").find(".view-btn");
        const id = src.attr("data-id");

        $("#edit_application_id").val(id);
        $("#editApplicationIdLabel").text(id);

        $.each(EDIT_FIELD_MAP, function (field, key) {
            $("#edit_" + field).val(src.attr("data-" + key) || "");
        });
    });

    // Refresh the table row after a successful save
    function updateApplicationRow(row, d, dobDisplay) {
        const cells = row.children("td");
        const fullName = d.firstname + " " + d.lastname;

        row.attr("data-student", fullName)
            .attr("data-father", d.father_name)
            .attr("data-mobile", d.mobile_number);

        row.find(".student-avatar").text(d.firstname.charAt(0).toUpperCase());
        row.find(".student-name strong").text(fullName);
        row.find(".student-name small").text(d.gender);

        cells.eq(2).text(dobDisplay);
        cells.eq(3).text(d.gender);
        cells.eq(4).text(d.applying_for_class);
        cells.eq(5).text(d.academic_year);
        cells.eq(6).text(d.father_name);
        cells.eq(7).text(d.mobile_number);

        // keep the View button in sync so it shows the new values
        const viewBtn = row.find(".view-btn");
        $.each(EDIT_FIELD_MAP, function (field, key) {
            viewBtn.attr("data-" + key, d[field]);
        });
        viewBtn.removeData(); // clear jQuery's cached .data() values
    }

    // Save
    $("#editApplicationForm").on("submit", function (e) {
        e.preventDefault();

        const id = $("#edit_application_id").val();
        const $btn = $("#saveEditApplication").prop("disabled", true).text("Saving...");

        $.ajax({
            url: window.location.href,
            type: "POST",
            headers: { "X-Requested-With": "XMLHttpRequest" },
            data: $(this).serialize(),   // includes csrf token, action, application_id
            success: function (res) {
                const row = $("#applicationsTable tbody tr").filter(function () {
                    return $(this).find(".application-id").text().trim() === String(id);
                });
                if (row.length) {
                    updateApplicationRow(row, res.data, res.dob_display);
                }
                $("#editApplicationModal").modal("hide");
                showToast("Application updated successfully.", "success");
            },
            error: function (xhr) {
                const msg = (xhr.responseJSON && xhr.responseJSON.error)
                    || "Could not save changes. Please try again.";
                showToast(msg, "error");
            },
            complete: function () {
                $btn.prop("disabled", false).text("Save Changes");
            }
        });
    });
});