/**
 * Visual Task Graph - Interactive task relationship visualization
 * Allows dragging, dropping, and connecting tasks in a web-like graph
 */

class TaskGraph {
    constructor(flowApp) {
        this.app = flowApp;
        this.canvas = null;
        this.ctx = null;
        this.nodes = new Map(); // taskId -> {x, y, task, selected, connections}
        this.edges = []; // [{from: taskId, to: taskId, type: 'depends', 'relates', 'part_of'}]
        this.selectedNode = null;
        this.dragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.connecting = false;
        this.connectionStart = null;
        this.connectionMode = false;
        this.connectionType = 'relates'; // 'relates', 'depends', 'part_of'
        this.selectedEdge = null;
        this.zoom = 1;
        this.pan = { x: 0, y: 0 };
        this.lastPanPoint = null;
        this.minZoom = 0.5;
        this.maxZoom = 2;
        this.nodeButtonSize = 8; // Size of connection buttons on nodes
        this.nodeButtonOffset = 15; // Distance from node edge
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.loadTasks();
        this.animate();
    }

    setupCanvas() {
        const container = document.getElementById('taskGraphContainer');
        if (!container) return;

        this.canvas = document.createElement('canvas');
        this.canvas.id = 'taskGraphCanvas';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.display = 'block';
        container.appendChild(this.canvas);

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        if (!this.canvas) return;
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // Set actual canvas size (not just CSS)
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        this.ctx = this.canvas.getContext('2d');
    }

    async loadTasks() {
        if (!this.app || !this.app.tasks) return;
        
        const tasks = this.app.tasks.filter(t => !t.completed);
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.3;
        const angleStep = (Math.PI * 2) / tasks.length;

        tasks.forEach((task, index) => {
            const angle = angleStep * index;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            // Load saved position if exists
            const savedPos = this.loadNodePosition(task.id);
            this.nodes.set(task.id, {
                task: task,
                x: savedPos ? savedPos.x : x,
                y: savedPos ? savedPos.y : y,
                selected: false,
                width: 120,
                height: 80
            });
        });

        // Load connections
        this.loadConnections();
        this.render();
    }

    loadNodePosition(taskId) {
        const saved = localStorage.getItem(`task_graph_node_${taskId}`);
        if (saved) {
            return JSON.parse(saved);
        }
        return null;
    }

    saveNodePosition(taskId, x, y) {
        localStorage.setItem(`task_graph_node_${taskId}`, JSON.stringify({ x, y }));
    }

    loadConnections() {
        const saved = localStorage.getItem('task_graph_connections');
        if (saved) {
            try {
                this.edges = JSON.parse(saved);
            } catch (e) {
                console.error('Error loading connections:', e);
                this.edges = [];
            }
        }
    }

    saveConnections() {
        localStorage.setItem('task_graph_connections', JSON.stringify(this.edges));
    }

    setupEventListeners() {
        if (!this.canvas) return;

        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));

        // Touch events
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));

        // Context menu for connections
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleRightClick(e);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' && this.selectedNode) {
                this.deleteSelectedNode();
            }
        });
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left - this.pan.x) / this.zoom,
            y: (e.clientY - rect.top - this.pan.y) / this.zoom
        };
    }

    getTouchPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0] || e.changedTouches[0];
        return {
            x: (touch.clientX - rect.left - this.pan.x) / this.zoom,
            y: (touch.clientY - rect.top - this.pan.y) / this.zoom
        };
    }

    getNodeAt(x, y) {
        for (const [id, node] of this.nodes.entries()) {
            if (x >= node.x - node.width / 2 &&
                x <= node.x + node.width / 2 &&
                y >= node.y - node.height / 2 &&
                y <= node.y + node.height / 2) {
                return { id, node };
            }
        }
        return null;
    }

    getConnectionButtonAt(x, y) {
        for (const [id, node] of this.nodes.entries()) {
            const buttons = this.getConnectionButtons(node);
            for (const btn of buttons) {
                const dx = x - btn.x;
                const dy = y - btn.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= this.nodeButtonSize * 1.5) {
                    return { nodeId: id, button: btn };
                }
            }
        }
        return null;
    }

    getConnectionButtons(node) {
        const buttons = [];
        const offset = this.nodeButtonOffset;
        const size = this.nodeButtonSize;
        
        // Top, Right, Bottom, Left buttons
        buttons.push({ x: node.x, y: node.y - node.height / 2 - offset, position: 'top' });
        buttons.push({ x: node.x + node.width / 2 + offset, y: node.y, position: 'right' });
        buttons.push({ x: node.x, y: node.y + node.height / 2 + offset, position: 'bottom' });
        buttons.push({ x: node.x - node.width / 2 - offset, y: node.y, position: 'left' });
        
        return buttons;
    }

    getEdgeAt(x, y) {
        const threshold = 8 / this.zoom; // Adjusted for zoom level
        
        for (const edge of this.edges) {
            const fromNode = this.nodes.get(edge.from);
            const toNode = this.nodes.get(edge.to);
            if (!fromNode || !toNode) continue;

            // Check if point is near the line
            const dist = this.pointToLineDistance(x, y, fromNode.x, fromNode.y, toNode.x, toNode.y);
            if (dist < threshold) {
                return edge;
            }
        }
        return null;
    }

    pointToLineDistance(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) param = dot / lenSq;

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    handleMouseDown(e) {
        const pos = this.getMousePos(e);
        
        // Check for connection button click first
        const buttonHit = this.getConnectionButtonAt(pos.x, pos.y);
        if (buttonHit && e.button === 0) {
            if (this.connectionMode && this.connectionStart && this.connectionStart !== buttonHit.nodeId) {
                // Complete connection
                this.createConnection(this.connectionStart, buttonHit.nodeId, this.connectionType);
                this.connectionMode = false;
                this.connectionStart = null;
                this.updateConnectionModeUI();
            } else if (this.connectionMode && !this.connectionStart) {
                // Start connection
                this.connectionStart = buttonHit.nodeId;
                this.selectedNode = buttonHit.nodeId;
                this.nodes.get(buttonHit.nodeId).selected = true;
            } else if (!this.connectionMode) {
                // Enable connection mode
                this.connectionMode = true;
                this.connectionStart = buttonHit.nodeId;
                this.selectedNode = buttonHit.nodeId;
                this.nodes.get(buttonHit.nodeId).selected = true;
                this.updateConnectionModeUI();
            }
            this.render();
            return;
        }

        // Check for edge (connection) click for deletion
        if (e.button === 2 || (e.button === 0 && e.shiftKey)) { // Right-click or Shift+click
            const edgeHit = this.getEdgeAt(pos.x, pos.y);
            if (edgeHit) {
                if (confirm('Delete this connection?')) {
                    this.deleteConnection(edgeHit.from, edgeHit.to);
                }
                this.render();
                return;
            }
        }

        const hit = this.getNodeAt(pos.x, pos.y);

        if (e.button === 0) { // Left click
            if (hit) {
                // Don't start dragging if in connection mode
                if (!this.connectionMode) {
                    this.selectedNode = hit.id;
                    hit.node.selected = true;
                    this.dragging = true;
                    this.dragOffset.x = pos.x - hit.node.x;
                    this.dragOffset.y = pos.y - hit.node.y;
                }
            } else {
                if (!this.connectionMode) {
                    this.selectedNode = null;
                    this.nodes.forEach(node => node.selected = false);
                    // Start panning
                    this.lastPanPoint = pos;
                }
            }
        }
        this.render();
    }

    handleMouseMove(e) {
        const pos = this.getMousePos(e);

        if (this.dragging && this.selectedNode) {
            const node = this.nodes.get(this.selectedNode);
            if (node) {
                node.x = pos.x - this.dragOffset.x;
                node.y = pos.y - this.dragOffset.y;
                this.saveNodePosition(this.selectedNode, node.x, node.y);
            }
            this.render();
        } else if (this.lastPanPoint && !this.selectedNode) {
            // Panning
            this.pan.x += (pos.x - this.lastPanPoint.x) * this.zoom;
            this.pan.y += (pos.y - this.lastPanPoint.y) * this.zoom;
            this.lastPanPoint = pos;
            this.render();
        } else if (this.connecting) {
            this.render();
            // Draw temporary connection line
            this.drawConnectionPreview(pos);
        }
    }

    handleMouseUp(e) {
        // Cancel connection mode if clicking empty space (unless we just completed a connection)
        if (this.connectionMode && this.connectionStart && e.button === 0) {
            const pos = this.getMousePos(e);
            const buttonHit = this.getConnectionButtonAt(pos.x, pos.y);
            const nodeHit = this.getNodeAt(pos.x, pos.y);
            
            // If not clicking on a connection button or the same node, cancel connection mode
            if (!buttonHit && (!nodeHit || nodeHit.id === this.connectionStart)) {
                this.cancelConnection();
            }
        }

        this.dragging = false;
        this.lastPanPoint = null;
        this.render();
    }

    cancelConnection() {
        this.connectionMode = false;
        this.connectionStart = null;
        if (this.selectedNode) {
            this.nodes.get(this.selectedNode).selected = false;
        }
        this.selectedNode = null;
        this.updateConnectionModeUI();
    }

    toggleConnectionMode() {
        this.connectionMode = !this.connectionMode;
        if (!this.connectionMode) {
            this.connectionStart = null;
            if (this.selectedNode) {
                this.nodes.get(this.selectedNode).selected = false;
            }
            this.selectedNode = null;
        }
        this.updateConnectionModeUI();
    }

    setConnectionType(type) {
        this.connectionType = type;
        this.updateConnectionModeUI();
    }

    updateConnectionModeUI() {
        const btn = document.getElementById('toggleConnectionModeBtn');
        if (btn) {
            btn.classList.toggle('active', this.connectionMode);
            if (this.connectionMode) {
                btn.textContent = 'Cancel Connection';
                btn.classList.add('btn-danger');
                btn.classList.remove('btn-primary');
            } else {
                btn.textContent = 'Connect Tasks';
                btn.classList.add('btn-primary');
                btn.classList.remove('btn-danger');
            }
        }

        const typeSelector = document.getElementById('connectionTypeSelector');
        if (typeSelector) {
            typeSelector.disabled = !this.connectionMode;
            typeSelector.value = this.connectionType;
        }
    }

    centerView() {
        if (this.nodes.size === 0) return;

        // Calculate bounding box of all nodes
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        this.nodes.forEach(node => {
            minX = Math.min(minX, node.x - node.width / 2);
            maxX = Math.max(maxX, node.x + node.width / 2);
            minY = Math.min(minY, node.y - node.height / 2);
            maxY = Math.max(maxY, node.y + node.height / 2);
        });

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const width = maxX - minX;
        const height = maxY - minY;

        // Set pan to center the view
        this.pan.x = this.canvas.width / 2 - centerX * this.zoom;
        this.pan.y = this.canvas.height / 2 - centerY * this.zoom;

        // Adjust zoom to fit all nodes with padding
        const padding = 50;
        const scaleX = (this.canvas.width - padding * 2) / width;
        const scaleY = (this.canvas.height - padding * 2) / height;
        this.zoom = Math.min(scaleX, scaleY, this.maxZoom);
        this.zoom = Math.max(this.zoom, this.minZoom);

        this.render();
    }

    autoLayout() {
        if (this.nodes.size === 0) return;

        // Use force-directed layout algorithm (simplified)
        const iterations = 100;
        const k = Math.sqrt((this.canvas.width * this.canvas.height) / this.nodes.size);
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        for (let iter = 0; iter < iterations; iter++) {
            const forces = new Map();

            this.nodes.forEach((node, id) => {
                forces.set(id, { x: 0, y: 0 });
            });

            // Repulsion between all nodes
            for (const [id1, node1] of this.nodes.entries()) {
                for (const [id2, node2] of this.nodes.entries()) {
                    if (id1 === id2) continue;

                    const dx = node2.x - node1.x;
                    const dy = node2.y - node1.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

                    const force = k * k / dist;
                    const fx = (dx / dist) * force;
                    const fy = (dy / dist) * force;

                    const f1 = forces.get(id1);
                    f1.x -= fx * 0.1;
                    f1.y -= fy * 0.1;
                }
            }

            // Attraction along edges
            this.edges.forEach(edge => {
                const node1 = this.nodes.get(edge.from);
                const node2 = this.nodes.get(edge.to);
                if (!node1 || !node2) return;

                const dx = node2.x - node1.x;
                const dy = node2.y - node1.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;

                const force = dist * dist / k;
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;

                const f1 = forces.get(edge.from);
                const f2 = forces.get(edge.to);
                f1.x += fx * 0.01;
                f1.y += fy * 0.01;
                f2.x -= fx * 0.01;
                f2.y -= fy * 0.01;
            });

            // Apply forces
            forces.forEach((force, id) => {
                const node = this.nodes.get(id);
                if (node) {
                    node.x += force.x;
                    node.y += force.y;
                    this.saveNodePosition(id, node.x, node.y);
                }
            });
        }

        this.centerView();
    }

    handleWheel(e) {
        e.preventDefault();
        const delta = e.deltaY * -0.001;
        const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom + delta));
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Zoom towards mouse position
        const zoomFactor = newZoom / this.zoom;
        this.pan.x = mouseX - (mouseX - this.pan.x) * zoomFactor;
        this.pan.y = mouseY - (mouseY - this.pan.y) * zoomFactor;
        
        this.zoom = newZoom;
        this.render();
    }

    handleDoubleClick(e) {
        const pos = this.getMousePos(e);
        const hit = this.getNodeAt(pos.x, pos.y);
        
        if (hit && this.app) {
            this.app.openTaskEditor(hit.id);
        }
    }

    handleRightClick(e) {
        const pos = this.getMousePos(e);
        
        // Check for edge first
        const edgeHit = this.getEdgeAt(pos.x, pos.y);
        if (edgeHit) {
            // Show edge context menu
            this.showEdgeContextMenu(e, edgeHit);
            return;
        }
        
        const hit = this.getNodeAt(pos.x, pos.y);
        if (hit && this.app) {
            // Cancel connection mode if active
            if (this.connectionMode) {
                this.cancelConnection();
                return;
            }
            
            // Show context menu for node
            const syntheticEvent = {
                clientX: e.clientX,
                clientY: e.clientY
            };
            this.app.showTaskContextMenu(syntheticEvent, hit.id);
        }
    }

    showEdgeContextMenu(event, edge) {
        const menu = document.createElement('div');
        menu.className = 'edge-context-menu';
        menu.style.position = 'fixed';
        menu.style.left = `${event.clientX}px`;
        menu.style.top = `${event.clientY}px`;
        menu.style.zIndex = '10001';

        menu.innerHTML = `
            <div class="edge-menu-item" data-action="delete">Delete Connection</div>
            <div class="edge-menu-item" data-action="info">Connection Info</div>
        `;

        document.body.appendChild(menu);

        menu.querySelectorAll('.edge-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                if (action === 'delete') {
                    this.deleteConnection(edge.from, edge.to);
                } else if (action === 'info') {
                    this.showEdgeInfo(edge);
                }
                menu.remove();
            });
        });

        // Close on outside click
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 10);
    }

    showEdgeInfo(edge) {
        const fromNode = this.nodes.get(edge.from);
        const toNode = this.nodes.get(edge.to);
        if (!fromNode || !toNode) return;

        const typeNames = {
            'relates': 'Related To',
            'depends': 'Depends On',
            'part_of': 'Part Of'
        };

        const message = `${fromNode.task.title}\n${typeNames[edge.type] || edge.type}\n${toNode.task.title}`;
        alert(message);
    }

    handleTouchStart(e) {
        e.preventDefault();
        const pos = this.getTouchPos(e);
        const hit = this.getNodeAt(pos.x, pos.y);

        if (hit) {
            this.selectedNode = hit.id;
            hit.node.selected = true;
            this.dragging = true;
            this.dragOffset.x = pos.x - hit.node.x;
            this.dragOffset.y = pos.y - hit.node.y;
        } else {
            this.lastPanPoint = pos;
        }
        this.render();
    }

    handleTouchMove(e) {
        e.preventDefault();
        const pos = this.getTouchPos(e);

        if (this.dragging && this.selectedNode) {
            const node = this.nodes.get(this.selectedNode);
            if (node) {
                node.x = pos.x - this.dragOffset.x;
                node.y = pos.y - this.dragOffset.y;
                this.saveNodePosition(this.selectedNode, node.x, node.y);
            }
            this.render();
        } else if (this.lastPanPoint) {
            this.pan.x += (pos.x - this.lastPanPoint.x) * this.zoom;
            this.pan.y += (pos.y - this.lastPanPoint.y) * this.zoom;
            this.lastPanPoint = pos;
            this.render();
        }
    }

    handleTouchEnd(e) {
        e.preventDefault();
        this.dragging = false;
        this.lastPanPoint = null;
    }

    createConnection(fromId, toId, type = 'relates') {
        // Check if connection already exists
        const exists = this.edges.some(e => 
            (e.from === fromId && e.to === toId) || 
            (e.from === toId && e.to === fromId)
        );

        if (!exists) {
            this.edges.push({ from: fromId, to: toId, type });
            this.saveConnections();
            this.render();
            
            if (window.utils) {
                window.utils.showToast('Tasks connected', 'success');
            }
        }
    }

    deleteConnection(fromId, toId) {
        this.edges = this.edges.filter(e => 
            !(e.from === fromId && e.to === toId) && 
            !(e.from === toId && e.to === fromId)
        );
        this.saveConnections();
        this.render();
    }

    deleteSelectedNode() {
        if (!this.selectedNode) return;
        
        // Remove all connections involving this node
        this.edges = this.edges.filter(e => 
            e.from !== this.selectedNode && e.to !== this.selectedNode
        );
        this.saveConnections();
        
        // Remove node
        this.nodes.delete(this.selectedNode);
        this.selectedNode = null;
        this.render();
    }

    drawConnectionPreview(mousePos) {
        if (!this.connectionStart) return;
        
        const startNode = this.nodes.get(this.connectionStart);
        if (!startNode) return;

        this.ctx.save();
        this.ctx.translate(this.pan.x, this.pan.y);
        this.ctx.scale(this.zoom, this.zoom);

        this.ctx.strokeStyle = '#A9C6FF';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(startNode.x, startNode.y);
        this.ctx.lineTo(mousePos.x, mousePos.y);
        this.ctx.stroke();

        this.ctx.restore();
    }

    render() {
        if (!this.ctx || !this.canvas) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(this.pan.x, this.pan.y);
        this.ctx.scale(this.zoom, this.zoom);

        // Draw edges (connections) first
        this.drawEdges();

        // Draw nodes (tasks) on top
        this.drawNodes();

        this.ctx.restore();
    }

    drawEdges() {
        this.edges.forEach((edge, index) => {
            const fromNode = this.nodes.get(edge.from);
            const toNode = this.nodes.get(edge.to);

            if (!fromNode || !toNode) return;

            // Determine color based on connection type
            let color = '#E4E4E6';
            if (edge.type === 'depends') color = '#F59E0B'; // Orange for dependencies
            else if (edge.type === 'part_of') color = '#8B5CF6'; // Purple for part of
            else color = '#A9C6FF'; // Blue for relates

            // Highlight if selected
            const isSelected = this.selectedEdge && 
                ((this.selectedEdge.from === edge.from && this.selectedEdge.to === edge.to) ||
                 (this.selectedEdge.from === edge.to && this.selectedEdge.to === edge.from));

            this.ctx.strokeStyle = isSelected ? '#EF4444' : color;
            this.ctx.lineWidth = isSelected ? 3 : 2;
            this.ctx.setLineDash([]);
            this.ctx.beginPath();
            this.ctx.moveTo(fromNode.x, fromNode.y);
            this.ctx.lineTo(toNode.x, toNode.y);
            this.ctx.stroke();

            // Draw arrow at the end
            this.drawArrow(fromNode.x, fromNode.y, toNode.x, toNode.y, isSelected ? '#EF4444' : color);
        });
    }

    drawArrow(fromX, fromY, toX, toY, color) {
        const angle = Math.atan2(toY - fromY, toX - fromX);
        const arrowLength = 10;
        const arrowAngle = Math.PI / 6;

        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(toX, toY);
        this.ctx.lineTo(
            toX - arrowLength * Math.cos(angle - arrowAngle),
            toY - arrowLength * Math.sin(angle - arrowAngle)
        );
        this.ctx.lineTo(
            toX - arrowLength * Math.cos(angle + arrowAngle),
            toY - arrowLength * Math.sin(angle + arrowAngle)
        );
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawNodes() {
        this.nodes.forEach((node, taskId) => {
            const task = node.task;
            const priority = task.priority || 'normal';
            
            // Node background
            let bgColor = '#FFFFFF';
            if (node.selected) bgColor = '#F0F4FF';
            if (this.connectionMode && this.connectionStart === taskId) bgColor = '#FFF3D6';
            
            // Priority border
            let borderColor = '#E4E4E6';
            if (priority === 'high') borderColor = '#EF4444';
            else if (priority === 'medium') borderColor = '#F59E0B';
            else if (priority === 'low') borderColor = '#10B981';

            // Draw shadow
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 2;

            // Draw node rectangle
            this.ctx.fillStyle = bgColor;
            this.ctx.strokeStyle = borderColor;
            this.ctx.lineWidth = node.selected ? 3 : 2;
            this.ctx.fillRect(
                node.x - node.width / 2,
                node.y - node.height / 2,
                node.width,
                node.height
            );
            this.ctx.strokeRect(
                node.x - node.width / 2,
                node.y - node.height / 2,
                node.width,
                node.height
            );

            // Reset shadow
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;

            // Draw task title
            this.ctx.fillStyle = '#2C2C2C';
            this.ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Truncate text if too long
            const maxWidth = node.width - 16;
            let title = task.title;
            const metrics = this.ctx.measureText(title);
            if (metrics.width > maxWidth) {
                while (this.ctx.measureText(title + '...').width > maxWidth && title.length > 0) {
                    title = title.slice(0, -1);
                }
                title += '...';
            }
            
            this.ctx.fillText(title, node.x, node.y - 8);

            // Draw task metadata
            this.ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            this.ctx.fillStyle = '#6B7280';
            
            let metadata = '';
            if (task.due_date) {
                const dueDate = new Date(task.due_date);
                metadata = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
            if (metadata) {
                this.ctx.fillText(metadata, node.x, node.y + 12);
            }

            // Draw connection buttons
            this.drawConnectionButtons(node, taskId);
        });
    }

    drawConnectionButtons(node, taskId) {
        const buttons = this.getConnectionButtons(node);
        const isStartNode = this.connectionStart === taskId;
        
        buttons.forEach(btn => {
            // Highlight if in connection mode and this is the start node
            let buttonColor = '#A9C6FF';
            if (this.connectionMode) {
                if (isStartNode) {
                    buttonColor = '#F59E0B'; // Orange for start
                } else {
                    buttonColor = '#10B981'; // Green for available targets
                }
            }

            // Draw button circle
            this.ctx.fillStyle = buttonColor;
            this.ctx.beginPath();
            this.ctx.arc(btn.x, btn.y, this.nodeButtonSize, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw border
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Draw plus icon in connection mode
            if (this.connectionMode && !isStartNode) {
                this.ctx.strokeStyle = '#FFFFFF';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(btn.x - 3, btn.y);
                this.ctx.lineTo(btn.x + 3, btn.y);
                this.ctx.moveTo(btn.x, btn.y - 3);
                this.ctx.lineTo(btn.x, btn.y + 3);
                this.ctx.stroke();
            }
        });
    }

    animate() {
        this.render();
        requestAnimationFrame(() => this.animate());
    }

    refresh() {
        this.loadTasks();
        this.render();
    }

    clearAll() {
        if (confirm('Clear all connections? This will remove all task relationships.')) {
            this.edges = [];
            this.saveConnections();
            this.render();
        }
    }

    exportGraph() {
        const data = {
            nodes: Array.from(this.nodes.entries()).map(([id, node]) => ({
                taskId: id,
                x: node.x,
                y: node.y
            })),
            edges: this.edges,
            zoom: this.zoom,
            pan: this.pan
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `task-graph-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importGraph(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.nodes) {
                    data.nodes.forEach(({ taskId, x, y }) => {
                        this.saveNodePosition(taskId, x, y);
                    });
                }
                if (data.edges) {
                    this.edges = data.edges;
                    this.saveConnections();
                }
                if (data.zoom) this.zoom = data.zoom;
                if (data.pan) this.pan = data.pan;
                this.refresh();
                
                if (window.utils) {
                    window.utils.showToast('Graph imported successfully', 'success');
                }
            } catch (error) {
                console.error('Error importing graph:', error);
                if (window.utils) {
                    window.utils.showToast('Error importing graph', 'error');
                }
            }
        };
        reader.readAsText(file);
    }
}

// Make it globally available
window.TaskGraph = TaskGraph;

