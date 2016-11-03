
module.exports = function (ignoreTagNamesRegex, str, values) {

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

      pieces.push( str.substring(lastCut, x) )
      lastCut = x + 1 + 2 // extra two for skipping {{

      var key = ''
      var currentSource = values
      var y = x + 2 // extra two for skipping {{

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
            console.log("hmm", str[y+1])
            throw new Error('Invalid syntax (missing closing curly bracket)')
          }
          pieces.push( currentSource[key] )
          lastCut = y + 2 // extra two for skipping }}
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
        // Not a tag name after all. Nothing to see here; move along
        continue
      }

      var tagName = str.substring(x+1, tagNameEnd+1)

      if ( ! tagName.match(ignoreTagNamesRegex) ) {
        // Not an ignored tag name. Move along!
        continue
      }

      //
      // At this point we've encountered a tag to ignore.
      //
      // First, find the end of the opening tag
      var openTagEnd = tagNameEnd+1
      while ( str[openTagEnd] !== '>' ) { openTagEnd++ }

      //
      // Next, find the closing tag
      //
      var closeTagEnd = openTagEnd + 1
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
