var color = '#FFFFFF';
var maxParticles = 2

// ParticlesJS Config.
particlesJS('particles-js', {
  'particles': {
    'number': {
      'value': maxParticles,
      'density': {
        'enable': true,
        'value_area': (maxParticles * 10) * 2
      }
    },
    'color': {
      'value': color
    },
    'shape': {
      'type': 'circle',
      'stroke': {
        'width': 0,
        'color': '#000000'
      },
      'polygon': {
        'nb_sides': 5
      },
    },
    'opacity': {
      'value': 0.5,
      'random': false,
      'anim': {
        'enable': false,
        'speed': 1,
        'opacity_min': 0.1,
        'sync': false
      }
    },
    'size': {
      'value': 3,
      'random': true,
      'anim': {
        'enable': false,
        'speed': 40,
        'size_min': 0.1,
        'sync': false
      }
    },
    'line_linked': {
      'enable': true,
      'distance': 150,
      'color': color,
      'opacity': 1,
      'width': 1
    },
    'move': {
      'enable': true,
      'speed': 2,
      'direction': 'none',
      'random': false,
      'straight': false,
      'out_mode': 'out',
      'bounce': false,
      'attract': {
        'enable': false,
        'rotateX': 600,
        'rotateY': 1200
      }
    }
  },
  'interactivity': {
    'detect_on': 'canvas',
    'events': {
      'onhover': {
        'enable': true,
        'mode': 'grab'
      },
      'onclick': {
        'enable': true,
        'mode': 'push'
      },
      'resize': true
    },
    'modes': {
      'grab': {
        'distance': 140,
        'line_linked': {
          'opacity': 0.2
        }
      },
      'bubble': {
        'distance': 400,
        'size': 40,
        'duration': 2,
        'opacity': 8,
        'speed': 3
      },
      'repulse': {
        'distance': 200,
        'duration': 0.4
      },
      'push': {
        'particles_nb': 4
      },
      'remove': {
        'particles_nb': 2
      }
    }
  },
  'retina_detect': true
});



/**
 * Inspired by https://www.reddit.com/r/dataisbeautiful/comments/jcjy9r/oc_prime_numbers_whenever_n_is_a_prime_number_the/
 */

const SPEED = 1

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')

document.body.appendChild(canvas)

function *getPrimes () {
  let primes = [2, 3]
  let p = 3
  yield 2
  yield 3

  function isPrime (value) {
    for (let i = 0; primes[i] * primes[i] <= value; i++) {
      if (value % primes[i] === 0) return false
    }
    return true
  }

  while (true) {
    p += 2
    if (isPrime(p)) {
      yield p
      primes.push(p)
    }
  }
}

const SIN_60 = Math.sqrt(3) / 2

function rotate90Deg (rot) {
  return [-rot[1], rot[0]]
}

function rotate60Deg (rot) {
  const a = 0.5
  const b = SIN_60
  return [a * rot[0] - b * rot[1], a * rot[1] + b * rot[0]]
}

function rotate120Deg (rot) {
  const a = -0.5
  const b = SIN_60
  return [a * rot[0] - b * rot[1], a * rot[1] + b * rot[0]]
}

class Renderer {
  constructor (canvas, boundingBox) {
    this.canvas = canvas
    this.boundingBox = boundingBox
    this.padding = 5

    this.offX = 0
    this.offY = 0
    this.scaleX = 1
    this.scaleY = 1
  }

  onResize () {
    this.scaleX = (this.canvas.width - 2 * this.padding) / (this.boundingBox.maxX - this.boundingBox.minX)
    this.scaleY = (this.canvas.height - 2 * this.padding) / (this.boundingBox.maxY - this.boundingBox.minY)
    if (this.scaleX > this.scaleY) {
      this.scaleX = this.scaleY
      this.offX = 0.5 * (this.canvas.width - (this.boundingBox.maxX - this.boundingBox.minX) * this.scaleX)
      this.offY = this.padding
    }
    else if (this.scaleY > this.scaleX) {
      this.scaleY = this.scaleX
      this.offY = 0.5 * (this.canvas.height - (this.boundingBox.maxY - this.boundingBox.minY) * this.scaleY)
      this.offX = this.padding
    }
  }

  renderLine (points) {
    ctx.beginPath()
    let first = true
    for (let [x, y] of points) {
      let transformedX = this.offX + (x - this.boundingBox.minX) * this.scaleX
      let transformedY = this.offY + (y - this.boundingBox.minY) * this.scaleY

      if (first) {
        ctx.moveTo(transformedX, transformedY)
        first = false
      } else {
        ctx.lineTo(transformedX, transformedY)
      }
    }

    ctx.stroke()
  }
}

class BoundingBox {
  constructor () {
    this.minX = 0
    this.maxX = 0
    this.minY = 0
    this.maxY = 0
  }

  update (point) {
    if (point[0] < this.minX) this.minX = point[0]
    else if (point[0] > this.maxX) this.maxX = point[0]
    if (point[1] < this.minY) this.minY = point[1]
    else if (point[1] > this.maxY) this.maxY = point[1]
  }
}

class Pattern {
  constructor (startDir, rotateFunc, boundingBox) {
    this.rotateFunc = rotateFunc
    this.points = [[0, 0]]
    this.dir = startDir
    this.currentPoint = this.points[0]

    this.boundingBox = boundingBox
  }

  add (length) {
    this.currentPoint = [
      this.currentPoint[0] + this.dir[0] * length,
      this.currentPoint[1] + this.dir[1] * length
    ]

    this.boundingBox.update(this.currentPoint)

    this.points.push(this.currentPoint)

    this.dir = this.rotateFunc(this.dir)
  }

  render (style, renderer) {
    ctx.strokeStyle = style
    renderer.renderLine(this.points)
  }
}

async function main() {

  const boundingBox = new BoundingBox()
  let patterns = [
    new Pattern([0, 1], rotate60Deg, boundingBox),
    new Pattern([0, 1], rotate90Deg, boundingBox),
    new Pattern([0, 1], rotate120Deg, boundingBox)
  ]
  const renderer = new Renderer(canvas, boundingBox)

  function resize () {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight/2
    renderer.onResize()
  }

  resize()
  window.addEventListener('resize', resize, false)

  let counter = 1

  ctx.globalCompositeOperation = 'lighter'
  let previousPrime = 2
  for (let prime of getPrimes()) {
    const length = prime - previousPrime
    previousPrime = prime
    if (length === 0) {
      continue
    }

    for (let pattern of patterns) {
      pattern.add(length)
    }

    renderer.onResize()

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#011d22'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (counter++ % SPEED === 0) {

        patterns[0].render('rgba(20,2,255,0.25)', renderer)


        patterns[1].render('rgba(255,20,2,0.25)', renderer)


        patterns[2].render('rgba(2,255,20,0.25)', renderer)

      await new Promise(resolve => requestAnimationFrame(resolve))
    }
  }
}

main()




