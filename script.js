    import { CreateWebWorkerMLCEngine } from "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.46/+esm"

    const $ = el => document.querySelector(el)

    // Elementos del DOM
    const $form = $('form')
    const $input = $('input')
    const $template = $('#message-template')
    const $messages = $('ul')
    const $container = $('main')
    const $button = $('button')
    const $info = $('small')
    const $loading = $('.loading')

    // Variables de estado
    let messages = []
    let end = false
    let isGenerating = false
    let currentGeneration = null

    const SELECTED_MODEL = 'Llama-3-8B-Instruct-q4f32_1-MLC-1k'

    // Función para guardar el historial en localStorage
    function saveChatHistory() {
    localStorage.setItem('chatHistory', JSON.stringify(messages))
    }

    // Función para cargar el historial desde localStorage
    function loadChatHistory() {
    const savedHistory = localStorage.getItem('chatHistory')
    if (savedHistory) {
        try {
        const parsedHistory = JSON.parse(savedHistory)
        messages = parsedHistory
        
        // Mostrar mensajes en la UI
        parsedHistory.forEach(msg => {
            if (msg.role === 'user') {
            addMessage(msg.content, 'user')
            } else if (msg.role === 'assistant') {
            addMessage(msg.content, 'bot')
            }
        })
        } catch (e) {
        console.error('Error al cargar el historial:', e)
        localStorage.removeItem('chatHistory')
        }
    }
    }

    // Función para limpiar el historial (opcional)
    function clearChatHistory() {
    if (confirm('¿Estás seguro de que quieres borrar todo el historial del chat?')) {
        localStorage.removeItem('chatHistory')
        messages = []
        $messages.innerHTML = ''
        addMessage("Historial borrado. ¿En qué puedo ayudarte ahora?", 'bot')
    }
    }

    // Inicialización del motor LLM
    const engine = await CreateWebWorkerMLCEngine(
    new Worker('./worker.js', { type: 'module' }),
    SELECTED_MODEL,
    {
        initProgressCallback: (info) => {
        $info.textContent = info.text
        if(info.progress === 1 && !end) {
            end = true
            $loading?.parentNode?.removeChild($loading)
            $button.removeAttribute('disabled')
            
            // Cargar historial al iniciar
            loadChatHistory()
            
            // Mostrar mensaje de bienvenida solo si no hay historial
            if(messages.length === 0) {
            addMessage("¡Hola! Soy un ChatBot que se ejecuta completamente en tu navegador. ¿En qué puedo ayudarte hoy?", 'bot')
            }
            
            $input.focus()
        }
        }
    }
    )

    // Evento submit del formulario
    $form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const messageText = $input.value.trim()

    if(messageText === '' || isGenerating) return

    $input.value = ''
    $input.setAttribute('disabled', '')
    addMessage(messageText, 'user')
    
    $button.textContent = 'Stop'
    $button.classList.add('stop')
    isGenerating = true

    const userMessage = {
        role: 'user',
        content: messageText
    }

    messages.push(userMessage)
    saveChatHistory() // Guardar después del mensaje del usuario

    try {
        currentGeneration = engine.chat.completions.create({
        messages,
        stream: true
        })

        const chunks = await currentGeneration

        let reply = ""
        const $botMessage = addMessage("", 'bot')
        
        for await (const chunk of chunks) {
        if (!isGenerating) break
        
        const [choice] = chunk.choices
        const content = choice?.delta?.content ?? ""
        reply += content
        $botMessage.innerHTML = formatMarkdown(reply)
        }

        messages.push({
        role: 'assistant',
        content: reply
        })
        saveChatHistory() // Guardar después de la respuesta del bot
    } finally {
        isGenerating = false
        currentGeneration = null
        $button.textContent = 'Enviar'
        $button.classList.remove('stop')
        $input.removeAttribute('disabled')
        $container.scrollTop = $container.scrollHeight
    }
        })

    // Evento click del botón (para cancelar generación)
    $button.addEventListener('click', function(event) {
    if (isGenerating) {
        event.preventDefault()
        isGenerating = false
        $button.textContent = 'Enviar'
        $button.classList.remove('stop')
        $input.removeAttribute('disabled')
    }
        })

    // Función para añadir mensajes a la UI
    function addMessage(text, sender) {
    const clonedTemplate = $template.content.cloneNode(true)

    const $newMessage = clonedTemplate.querySelector('.message')
    const $who = $newMessage.querySelector('span')
    const $text = $newMessage.querySelector('p')

    $text.innerHTML = formatMarkdown(text)
    $who.textContent = sender == 'bot' ? 'GPT' : 'Tu'
    $newMessage.classList.add(sender)

    $messages.appendChild($newMessage)
    $container.scrollTop = $container.scrollHeight

    return $text
    }

    // Función para formatear markdown básico
    function formatMarkdown(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`{3}([\s\S]*?)`{3}/g, '<pre><code>$1</code></pre>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
    }

document.getElementById('clear-history')?.addEventListener('click', clearChatHistory)