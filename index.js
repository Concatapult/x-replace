
module.exports = function xReplace (ignoreTagNamesRegex, str, values) {

  if ( values === undefined ) {
    // Only two arguments were given; shift them to the right
    values = str
    str = ignoreTagNamesRegex
    ignoreTagNamesRegex = /^template$/
  }

  var pieces = []
  var lastCut = 0

  for (var x=0; x < str.length; x++) {

    if ( str[x] === '{' ) {

      if ( str[x+1] !== '{' ) {
        // Failed to match interpolation brackets
        x++ // Skip next character
        continue
      }

      //
      // Normalize quotes
      //
      var cutPoint = x
      var shouldInsertQuote = false
      if ( values.__inHtmlAttr__ ) {
        if ( str[x-1] === '=' ) {
          // No quote; insert our own
          shouldInsertQuote = true
        }
        else if ( str[x-2] === '=' && str[x-1] === '"' ) {
          // Double quote; cut it out and insert our own
          cutPoint--
          shouldInsertQuote = true
        }
      }

      pieces.push( str.substring(lastCut, cutPoint) )
      if ( shouldInsertQuote ) pieces.push("'")
      lastCut = x + 1 + 2 // extra two for skipping {{

      var key = ''
      var shouldEscape = true
      var currentSource = values
      var y = x + 2 // extra two for skipping {{

      if ( str[x+2] === '=' ) {
        shouldEscape = false
        lastCut++ // skip the =
        y++       // skip the =
      }

      // Skip leading whitespace
      while (str[y] === ' ' || str[y] === '\n') { y++ }

      // Calculate key
      while (y < str.length) {
        var c = str[y]

        if ( c === ' ' || c === '\n' ) {
          // Do nothing
        }
        else if ( c === '}' ) {
          // We've reached the end
          if ( str[y+1] !== '}' ) {
            throw new Error('Invalid syntax (missing closing curly bracket)')
          }

          var val = currentSource[key]

          if ( Array.isArray(val) || Object.prototype.toString.call(val) === '[object Object]' ) {
            val = JSON.stringify(val)
          }
          else {
            val = String(val || '')
          }

          pieces.push(
            values.__inHtmlAttr__
              ? encodeHtmlAttr(val)
              : ( shouldEscape ? escapeHTML(val) : val )
          )

          if ( shouldInsertQuote ) pieces.push("'")
          lastCut = y + 2 // extra two for skipping }}

          if ( shouldInsertQuote && str[lastCut] === '"' ) {
            lastCut++ // Skip doublequote
          }

          break
        }
        else if ( c === '.' ) {
          // TODO: SUBKEY
          currentSource = currentSource[key]
          key = ''
        }
        else {
          key += c
        }
        y++
      }
    }
    else if ( str[x] === '<' ) {
      var tagNameEnd = x
      while ( str[tagNameEnd+1].match(/[a-zA-Z0-9\-]/) ) { tagNameEnd++ }

      if ( tagNameEnd === x ) {
        // Not a tag name after all. Nothing to see here; move along!
        continue
      }
      tagNameEnd++

      var tagName = str.substring(x+1, tagNameEnd)
      pieces.push( str.substring(lastCut, tagNameEnd) )
      lastCut = tagNameEnd

      //
      // HTML attribute-aware string replacing;
      // Insert quotes when appropriate.
      //
      // First, find the end of the opening tag
      var openTagEnd = tagNameEnd
      while ( str[openTagEnd] !== '>' ) { openTagEnd++ }
      openTagEnd++


      // Next, x-replace string with quote flag
      var attrString = str.substring(tagNameEnd, openTagEnd)

      pieces.push(
        xReplace(ignoreTagNamesRegex, attrString, Object.assign({ __inHtmlAttr__: true }, values))
      )
      lastCut = openTagEnd

      //
      // Attributes are done; only continue if we need to.
      //
      if ( ! tagName.match(ignoreTagNamesRegex) ) {
        // Not an ignored tag name. Parse tag body as normal.
        x = openTagEnd - 1 // subtract one to accommodate for the `for` loop's x++
        continue
      }

      //
      // At this point we've encountered a tag to ignore.
      // Skip to its closing tag.
      //
      var closeTagEnd = openTagEnd
      searchClosingTag:
      while ( closeTagEnd < str.length ) {

        if (
          str[closeTagEnd] === '<' &&
          str[closeTagEnd+1] === '/' &&
          str.substr(closeTagEnd+2, tagName.length) === tagName
        ) {

          // Search for that last character!
          closeTagEnd = closeTagEnd + 2 + tagName.length

          while ( closeTagEnd < str.length ) {
            if ( str[closeTagEnd] === '>' ) {
              closeTagEnd++
              if ( closeTagEnd === str.length ) {
                // We've reached the end of the string, but that's ok.
                // Change it up to skip error handling condition.
                closeTagEnd++
              }
              break searchClosingTag
            }
            closeTagEnd++
          }
        }
        closeTagEnd++
      }

      if ( closeTagEnd === str.length ) {
        throw new Error('Could not find valid closing tag for `' + tagName + '`')
      }
      x = closeTagEnd
    }
  }

  // Append any trailing string
  if ( lastCut < str.length ) {
    pieces.push( str.substring(lastCut) )
  }

  return pieces.join('')
}

exports.encodeHtmlAttr = encodeHtmlAttr
exports.decodeHtmlAttr = decodeHtmlAttr

var ESC_MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
};

function encodeHtmlAttr(json) {
  return json.replace(/'/g, '&#39;')
}
function decodeHtmlAttr(json) {
  return json.replace(/&#39;/g, "'")
}

function escapeHTML(s) {
  return s.replace(/[&<>]/g, function(c) {
    return ESC_MAP[c];
  });
}
