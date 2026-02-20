const fs = require('fs');
const path = require('path');

const projectRoot = 'frontend';

const methodMap = {
    // Auth
    register: { service: 'authService', module: 'auth' },
    confirmAccount: { service: 'authService', module: 'auth' },
    login: { service: 'authService', module: 'auth' },
    forgotPassword: { service: 'authService', module: 'auth' },
    validateToken: { service: 'authService', module: 'auth' },
    resetPassword: { service: 'authService', module: 'auth' },
    getCurrentUser: { service: 'authService', module: 'auth' },
    updatePassword: { service: 'authService', module: 'auth' },

    // Projects
    getProjects: { service: 'projectsService', module: 'projects' },
    getProjectHistory: { service: 'projectsService', module: 'projects' },
    createIteration: { service: 'projectsService', module: 'projects' },
    reviewIteration: { service: 'projectsService', module: 'projects' },
    downloadFile: { service: 'projectsService', module: 'projects' },
    getDownloadUrl: { service: 'projectsService', module: 'projects' },
    getAllProjects: { service: 'projectsService', module: 'projects' },
    createProject: { service: 'projectsService', module: 'projects' },
    getProjectById: { service: 'projectsService', module: 'projects' },
    updateProject: { service: 'projectsService', module: 'projects' },
    deleteProject: { service: 'projectsService', module: 'projects' },
    downloadBulkTemplate: { service: 'projectsService', module: 'projects' },
    bulkUploadProjects: { service: 'projectsService', module: 'projects' },
    getStatuses: { service: 'projectsService', module: 'projects' },
    getFormData: { service: 'projectsService', module: 'projects' },
    getAvailableStudents: { service: 'projectsService', module: 'projects' },
    getAvailableAdvisors: { service: 'projectsService', module: 'projects' },

    // Dashboard
    getDashboardStats: { service: 'dashboardService', module: 'dashboard' },
    getTeacherDashboardStats: { service: 'dashboardService', module: 'dashboard' },

    // Events
    getEvents: { service: 'eventsService', module: 'events' },
    createEvent: { service: 'eventsService', module: 'events' },
    updateEvent: { service: 'eventsService', module: 'events' },
    deleteEvent: { service: 'eventsService', module: 'events' },

    // Persons
    getTeachers: { service: 'personsService', module: 'persons' },
    getStudents: { service: 'personsService', module: 'persons' },
    getPersonById: { service: 'personsService', module: 'persons' },
};

function processDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue;

        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            processDirectory(fullPath);
        } else if (entry.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
            let content = fs.readFileSync(fullPath, 'utf8');

            const apiImportRegex = /import\s+api\s+from\s+['"]([^'"]+legacy-api)['"];?/g;
            if (apiImportRegex.test(content) || content.includes('api.')) {

                let modulesNeeded = new Set();
                let changed = false;

                // Replace api.method with service.method
                // We do a regex carefully to not replace generic variable called "api" if it has nothing to do with it, but we assume it's our api object here.
                content = content.replace(/api\.(\w+)/g, (match, method) => {
                    if (methodMap[method]) {
                        const mapping = methodMap[method];
                        modulesNeeded.add(mapping);
                        changed = true;
                        return `${mapping.service}.${method}`;
                    }
                    return match;
                });

                if (changed || apiImportRegex.test(content)) {
                    // Remove the old import
                    content = content.replace(apiImportRegex, '');

                    // Generate new imports
                    const moduleImportStrings = Array.from(modulesNeeded).map(mapping => {
                        return `import { ${mapping.service} } from '@/modules/${mapping.module}/services/${mapping.module}.service';`;
                    });

                    if (moduleImportStrings.length > 0) {
                        // Find last import and insert after
                        const lastImportIndex = content.lastIndexOf('import ');
                        if (lastImportIndex !== -1) {
                            const endOfLine = content.indexOf('\n', lastImportIndex);
                            content = content.slice(0, endOfLine + 1) + moduleImportStrings.join('\n') + '\n' + content.slice(endOfLine + 1);
                        } else {
                            content = moduleImportStrings.join('\n') + '\n\n' + content;
                        }
                    }

                    fs.writeFileSync(fullPath, content, 'utf8');
                    console.log(`Updated API usages in ${fullPath}`);
                }
            }
        }
    }
}

processDirectory(projectRoot);
console.log('API Client refactoring replacement script completed');
