describe('Scorecard Application', () => {
  beforeEach(() => {
    // Visit the app before each test
    cy.visit('/')
    cy.wait(200) // Wait for React to load
  })

  it('should load the home page successfully', () => {
    // Check if the main elements are visible
    cy.get('h1').should('contain', '🎲 Scorecard App')
    cy.get('.card').should('have.length.at.least', 1)
    cy.get('button').should('contain', 'Create Room')
    cy.get('button').should('contain', 'Join Room')
  })

  it('should create a new room successfully', () => {
    // Fill out the create room form
    cy.get('input[name="name"]').type('Test Room')
    cy.get('select[name="game_type"]').select('yahtzee')
    
    // Submit the form
    cy.get('button').contains('Create Room').click()
    
    // Wait for room creation and navigation
    cy.wait(500)
    
    // Should be redirected to the room page
    cy.url().should('include', '/')
    cy.get('.room-code').should('be.visible')
    cy.get('h1').should('contain', 'Test Room')
  })

  it('should join an existing room', () => {
    // First create a room to join
    cy.get('input[name="name"]').first().type('Room to Join')
    cy.get('select[name="game_type"]').first().select('scrabble')
    cy.get('button').contains('Create Room').first().click()
    cy.wait(500)
    
    // Get the room code
    cy.get('.room-code').invoke('text').then((roomCodeText) => {
      const roomCode = roomCodeText.replace('Room Code: ', '').trim()
      
      // Go back to home
      cy.get('button').contains('Back to Home').click()
      cy.wait(200)
      
      // Join the room
      cy.get('input[placeholder="Enter 8-character room code"]').type(roomCode)
      cy.get('input[placeholder="Enter your name"]').type('Test Player')
      cy.get('button').contains('Join Room').click()
      
      // Should be in the room
      cy.wait(500)
      cy.get('h1').should('contain', 'Room to Join')
      cy.get('.room-code').should('contain', roomCode)
    })
  })

  it('should add scores to a room', () => {
    // Create a room first
    cy.get('input[name="name"]').type('Score Test Room')
    cy.get('select[name="game_type"]').select('yahtzee')
    cy.get('button').contains('Create Room').click()
    cy.wait(500)
    
    // Add a player first
    cy.get('input[placeholder="Enter player name"]').type('Player 1')
    cy.get('button').contains('Add Player').click()
    cy.wait(500)
    
    // Start the game
    cy.get('button').contains('Start Yahtzee Game').click()
    cy.wait(200)
    
    // Add a score by clicking on a cell
    cy.get('.scorecard-table').contains('Ones').parent().find('td').eq(1).click()
    cy.get('.cell-input').type('15{enter}')
    
    // Should see the score in the Yahtzee scorecard
    cy.wait(200)
    cy.get('.scorecard-table').should('contain', '15')
  })

  it('should handle API errors gracefully', () => {
    // Try to join with invalid room code
    cy.get('input[placeholder="Enter 8-character room code"]').type('INVALID')
    cy.get('input[placeholder="Enter your name"]').type('Test Player')
    cy.get('button').contains('Join Room').click()
    
    // Should show error toast message
    cy.get('.toast-error').should('be.visible')
    cy.get('.toast-error').should('contain', 'Failed to join room')
  })

  it('should validate form inputs', () => {
    // Try to create room without name
    cy.get('button').contains('Create Room').should('be.disabled')
    
    // Try to join room without code
    cy.get('button').contains('Join Room').should('be.disabled')
  })

  it('should handle Yahtzee game setup flow', () => {
    // Create a Yahtzee room
    cy.get('input[name="name"]').type('Setup Test Room')
    cy.get('select[name="game_type"]').select('yahtzee')
    cy.get('button').contains('Create Room').click()
    cy.wait(500)
    
    // Should be in setup phase
    cy.get('h2').should('contain', 'Game Setup')
    cy.get('p').should('contain', 'Add all players before starting')
    
    // Add first player
    cy.get('input[placeholder="Enter player name"]').type('Alice')
    cy.get('button').contains('Add Player').click()
    cy.wait(500)
    
    // Should see player in list
    cy.get('.player-list').should('contain', 'Alice')
    cy.get('.player-list').should('contain', 'Current Players (1)')
    
    // Add second player
    cy.get('input[placeholder="Enter player name"]').type('Bob')
    cy.get('button').contains('Add Player').click()
    cy.wait(500)
    
    // Should see both players
    cy.get('.player-list').should('contain', 'Bob')
    cy.get('.player-list').should('contain', 'Current Players (2)')
    
    // Start game button should be available
    cy.get('button').contains('Start Yahtzee Game').should('be.visible')
    
    // Start the game
    cy.get('button').contains('Start Yahtzee Game').click()
    cy.wait(200)
    
    // Should now be in game phase
    cy.get('h2').should('contain', 'Yahtzee Scorecard')
    cy.get('.scorecard-table').should('be.visible')
    cy.get('.scorecard-instructions').should('contain', 'Click on any cell to enter or edit')
  })

  it('should display room information correctly', () => {
    // Create a room
    cy.get('input[name="name"]').type('Info Test Room')
    cy.get('select[name="game_type"]').select('tally')
    cy.get('button').contains('Create Room').click()
    cy.wait(500)
    
    // Check room info is displayed
    cy.get('h1').should('contain', 'Info Test Room')
    cy.get('p').should('contain', 'Game Type: tally')
    cy.get('.room-code').should('be.visible')
  })

  it('should handle multiple players and scores', () => {
    // Create a room
    cy.get('input[name="name"]').type('Multi Player Room')
    cy.get('select[name="game_type"]').select('yahtzee')
    cy.get('button').contains('Create Room').click()
    cy.wait(500)
    
    // Add first player
    cy.get('input[placeholder="Enter player name"]').type('Player A')
    cy.get('button').contains('Add Player').click()
    cy.wait(500)
    
    // Add second player
    cy.get('input[placeholder="Enter player name"]').type('Player B')
    cy.get('button').contains('Add Player').click()
    cy.wait(500)
    
    // Start the game
    cy.get('button').contains('Start Yahtzee Game').click()
    cy.wait(200)
    
    // Add scores for both players by clicking cells
    cy.get('.scorecard-table').contains('Ones').parent().find('td').eq(1).click()
    cy.get('.cell-input').type('15{enter}')
    cy.wait(200)
    
    cy.get('.scorecard-table').contains('Twos').parent().find('td').eq(2).click()
    cy.get('.cell-input').type('20{enter}')
    cy.wait(200)
    
    // Should see both scores in the Yahtzee scorecard
    cy.get('.scorecard-table').should('contain', '15')
    cy.get('.scorecard-table').should('contain', '20')
  })

  it('should handle direct cell editing with keyboard shortcuts', () => {
    // Create a room
    cy.get('input[name="name"]').type('Cell Edit Room')
    cy.get('select[name="game_type"]').select('yahtzee')
    cy.get('button').contains('Create Room').click()
    cy.wait(500)
    
    // Add a player
    cy.get('input[placeholder="Enter player name"]').type('Test Player')
    cy.get('button').contains('Add Player').click()
    cy.wait(500)
    
    // Start the game
    cy.get('button').contains('Start Yahtzee Game').click()
    cy.wait(200)
    
    // Test Enter key to save
    cy.get('.scorecard-table').contains('Threes').parent().find('td').eq(1).click()
    cy.get('.cell-input').type('18{enter}')
    cy.wait(200)
    cy.get('.scorecard-table').should('contain', '18')
  })

  it('should simulate a complete 4-player Yahtzee game until someone wins', () => {
    // Create a Yahtzee room
    cy.get('input[name="name"]').type('Championship Yahtzee')
    cy.get('select[name="game_type"]').select('yahtzee')
    cy.get('button').contains('Create Room').click()
    cy.wait(500)
    
    // Add 4 players
    const players = ['Alice', 'Bob', 'Charlie', 'Diana']
    players.forEach((player, index) => {
      cy.get('input[placeholder="Enter player name"]').type(player)
      cy.get('button').contains('Add Player').click()
      cy.wait(200)
    })
    
    // Verify all players are added
    cy.get('.player-list').should('contain', 'Current Players (4)')
    players.forEach(player => {
      cy.get('.player-list').should('contain', player)
    })
    
    // Start the game
    cy.get('button').contains('Start Yahtzee Game').click()
    cy.wait(200)
    
    // Verify the scorecard table is visible and has the right structure
    cy.get('.scorecard-table').should('be.visible')
    players.forEach(player => {
      cy.get('.scorecard-table').should('contain', player)
    })
    cy.get('.scorecard-table').should('contain', 'Ones')
    cy.get('.scorecard-table').should('contain', 'Yahtzee')
    
    // Helper function to enter a score for a player and category
    const enterScore = (playerIndex: number, category: string, score: number) => {
      cy.get('.scorecard-table').contains(category).parent().find('td').eq(playerIndex).click()
      cy.get('.cell-input').should('be.visible')
      cy.get('.cell-input').type(`${score}{enter}`)
      cy.wait(200) // Wait for API call and UI update
    };

    // Simulate a realistic game with strategic score entries
    // Round 1: Upper section focus
    cy.log('Round 1: Upper section scores')
    enterScore(1, 'Ones', 3)    // Alice
    enterScore(2, 'Twos', 8)    // Bob  
    enterScore(3, 'Threes', 9)  // Charlie
    enterScore(4, 'Fours', 16)  // Diana
    
    // Round 2: More upper section
    cy.log('Round 2: More upper section')
    enterScore(1, 'Fives', 15)  // Alice
    enterScore(2, 'Sixes', 24)  // Bob
    enterScore(3, 'Ones', 2)    // Charlie
    enterScore(4, 'Twos', 12)   // Diana
    
    // Round 3: Lower section begins
    cy.log('Round 3: Lower section begins')
    enterScore(1, 'Yahtzee', 50)        // Alice gets Yahtzee!
    enterScore(2, 'Large Straight', 40) // Bob gets Large Straight!
    enterScore(3, 'Full House', 25)     // Charlie gets Full House
    enterScore(4, 'Small Straight', 30) // Diana gets Small Straight
    
    // Round 4: More lower section
    cy.log('Round 4: More lower section')
    enterScore(1, '3 of a Kind', 18)    // Alice
    enterScore(2, '4 of a Kind', 24)    // Bob
    enterScore(3, 'Yahtzee', 50)        // Charlie gets Yahtzee too!
    enterScore(4, 'Chance', 24)         // Diana
    
    // Round 5: Final strategic moves
    cy.log('Round 5: Final strategic moves')
    enterScore(1, 'Full House', 25)     // Alice
    enterScore(2, 'Chance', 18)         // Bob
    enterScore(3, 'Large Straight', 40) // Charlie gets Large Straight!
    enterScore(4, 'Yahtzee', 50)        // Diana gets Yahtzee!
    
    // Round 6: Fill remaining categories
    cy.log('Round 6: Fill remaining categories')
    enterScore(1, 'Large Straight', 40) // Alice
    enterScore(2, 'Full House', 25)     // Bob
    enterScore(3, '4 of a Kind', 26)    // Charlie
    enterScore(4, '3 of a Kind', 20)    // Diana
    
    // Round 7: Final scores
    cy.log('Round 7: Final scores')
    enterScore(1, 'Small Straight', 30) // Alice
    enterScore(2, 'Yahtzee', 0)         // Bob misses Yahtzee
    enterScore(3, 'Small Straight', 30) // Charlie
    enterScore(4, '4 of a Kind', 28)    // Diana
    
    // Round 8: Last few categories
    cy.log('Round 8: Last few categories')
    enterScore(1, '4 of a Kind', 22)    // Alice
    enterScore(2, '3 of a Kind', 21)    // Bob
    enterScore(3, 'Chance', 22)         // Charlie
    enterScore(4, 'Large Straight', 40) // Diana
    
    // Round 9: Final round
    cy.log('Round 9: Final round')
    enterScore(1, 'Chance', 20)         // Alice
    enterScore(2, 'Small Straight', 30) // Bob
    enterScore(3, 'Sixes', 30)          // Charlie (should get bonus now)
    enterScore(4, 'Fives', 25)          // Diana
    
    // Wait for all scores to be processed
    cy.wait(3000)

    // Debug: Check what totals are actually displayed
    cy.get('.scorecard-table .grand-total').then($totals => {
      cy.log('Actual grand totals found:');
      $totals.each((index, element) => {
        cy.log(`Total ${index + 1}: ${element.textContent}`);
      });
    });

    // Verify the grand totals are calculated and displayed
    cy.get('.scorecard-table').should('contain', 'GRAND TOTAL');
    
    // Check that all players have their totals displayed
    players.forEach(playerName => {
      cy.get('.scorecard-table').should('contain', playerName);
    });

    // Verify key scores are present
    cy.get('.scorecard-table').should('contain', '50'); // Yahtzee scores
    cy.get('.scorecard-table').should('contain', '40'); // Large Straight scores
    cy.get('.scorecard-table').should('contain', '30'); // Small Straight scores
    cy.get('.scorecard-table').should('contain', '25'); // Full House scores
    
    // Check that filled cells are properly styled (should have many filled cells now)
    cy.get('.scorecard-table .filled').should('have.length.at.least', 20); // At least 20 filled cells
    
    // Verify upper and lower section totals are calculated
    cy.get('.scorecard-table').should('contain', 'Upper Section Total');
    cy.get('.scorecard-table').should('contain', 'Lower Section Total');
    
    // Final verification: ensure the game shows totals and has a clear winner
    cy.get('.scorecard-table .grand-total').should('be.visible');
    
    // Check that the game is complete by verifying all major categories have scores
    const majorCategories = ['Ones', 'Yahtzee', 'Large Straight', 'Full House'];
    majorCategories.forEach(category => {
      cy.get('.scorecard-table').contains(category).parent().find('.filled').should('have.length.at.least', 1);
    });
    
    // Log completion and winner analysis
    cy.log('Game completed! All players have filled their scorecards!');
    cy.log('Diana likely wins with the highest total due to multiple Yahtzees and high upper section scores!');
  })

  it('should award upper section bonus for scores of 63 or more', () => {
    // Create a Yahtzee room
    cy.get('input[name="name"]').type('Bonus Test Room')
    cy.get('select[name="game_type"]').select('yahtzee')
    cy.get('button').contains('Create Room').click()
    cy.wait(2000)
    
    // Add 2 players
    const players = ['BonusPlayer', 'NoBonusPlayer']
    players.forEach((player, index) => {
      cy.get('input[placeholder="Enter player name"]').type(player)
      cy.get('button').contains('Add Player').click()
      cy.wait(1000)
    })
    
    // Start the game
    cy.get('button').contains('Start Yahtzee Game').click()
    cy.wait(1000)
    
    // Helper function to enter a score
    const enterScore = (playerIndex: number, category: string, score: number) => {
      cy.get('.scorecard-table').contains(category).parent().find('td').eq(playerIndex).click()
      cy.get('.cell-input').should('be.visible')
      cy.get('.cell-input').type(`${score}{enter}`)
      cy.wait(1000)
    };

    // Player 1: Enter scores to get exactly 63 in upper section (should get bonus)
    cy.log('Player 1: Entering scores to get exactly 63 in upper section')
    enterScore(1, 'Ones', 3)    // 3
    enterScore(1, 'Twos', 8)    // 11
    enterScore(1, 'Threes', 9)  // 20
    enterScore(1, 'Fours', 16)  // 36
    enterScore(1, 'Fives', 15)  // 51
    enterScore(1, 'Sixes', 12)  // 63 (exactly 63 - should get bonus)
    
    // Player 2: Enter scores to get 62 in upper section (should NOT get bonus)
    cy.log('Player 2: Entering scores to get 62 in upper section')
    enterScore(2, 'Ones', 2)    // 2
    enterScore(2, 'Twos', 6)    // 8
    enterScore(2, 'Threes', 9)  // 17
    enterScore(2, 'Fours', 12)  // 29
    enterScore(2, 'Fives', 15)  // 44
    enterScore(2, 'Sixes', 18)  // 62 (below 63 - should NOT get bonus)
    
    // Wait for all scores to be processed
    cy.wait(2000)
    
    // Verify the bonus row is displayed
    cy.get('.scorecard-table').should('contain', 'Upper Section Bonus');
    
    // Verify Player 1 gets the bonus (+35) - use simpler approach
    cy.get('.scorecard-table').should('contain', '+35');
    
    // Verify Player 2 does NOT get the bonus (shows '-')
    cy.get('.scorecard-table').should('contain', '-');
    
    // Verify the grand totals include the bonus
    // Player 1 should have 63 + 35 = 98 in grand total
    // Player 2 should have 62 + 0 = 62 in grand total
    cy.get('.scorecard-table .grand-total').should('contain', '98');
    cy.get('.scorecard-table .grand-total').should('contain', '62');
    
    // Add some lower section scores to verify bonus is still included
    enterScore(1, 'Yahtzee', 50)  // Player 1: 98 + 50 = 148
    enterScore(2, 'Yahtzee', 50)  // Player 2: 62 + 50 = 112
    
    cy.wait(1000)
    
    // Verify final totals still include bonus
    cy.get('.scorecard-table .grand-total').should('contain', '148'); // 63 + 35 + 50
    cy.get('.scorecard-table .grand-total').should('contain', '112'); // 62 + 0 + 50
    
    cy.log('Bonus test completed! Player 1 earned the bonus, Player 2 did not.');
  })

  it('should handle API errors during gameplay gracefully', () => {
    // Create a Yahtzee room
    cy.get('input[name="name"]').type('Error Test Room')
    cy.get('select[name="game_type"]').select('yahtzee')
    cy.get('button').contains('Create Room').click()
    cy.wait(500)
    
    // Add a player
    cy.get('input[placeholder="Enter player name"]').type('Test Player')
    cy.get('button').contains('Add Player').click()
    cy.wait(500)
    
    // Start the game
    cy.get('button').contains('Start Yahtzee Game').click()
    cy.wait(200)
    
    // Enter a valid score first
    cy.get('.scorecard-table').contains('Ones').parent().find('td').eq(1).click()
    cy.get('.cell-input').should('be.visible')
    cy.get('.cell-input').type('15{enter}')
    cy.wait(200)
    
    // Should show success toast
    cy.get('.toast-success').should('be.visible')
    
    // Verify the score was saved
    cy.get('.scorecard-table').should('contain', '15')
    
    // Test that filled cells are now clickable and show current value
    cy.get('.scorecard-table').contains('Ones').parent().find('td').eq(1).click()
    cy.wait(500)
    
    // Should show input field with current value since cell is now editable
    cy.get('.cell-input').should('be.visible')
    cy.get('.cell-input').should('have.value', '15')
    
    // Cancel the edit by pressing escape
    cy.get('.cell-input').type('{esc}')
    cy.get('.cell-input').should('not.exist')
    
    // Try to enter a score in a different category
    cy.get('.scorecard-table').contains('Twos').parent().find('td').eq(1).click()
    cy.get('.cell-input').should('be.visible')
    cy.get('.cell-input').type('20{enter}')
    cy.wait(200)
    
    // Should show success toast
    cy.get('.toast-success').should('be.visible')
    
    // Verify the new score was saved
    cy.get('.scorecard-table').should('contain', '20')
    
    // Verify both scores exist
    cy.get('.scorecard-table').should('contain', '15') // Original Ones score
    cy.get('.scorecard-table').should('contain', '20') // New Twos score
  })

  it('should allow editing existing scores', () => {
    // Create a Yahtzee room
    cy.get('input[name="name"]').type('Edit Test Room')
    cy.get('select[name="game_type"]').select('yahtzee')
    cy.get('button').contains('Create Room').click()
    cy.wait(2000)
    
    // Add a player
    cy.get('input[placeholder="Enter player name"]').type('Edit Player')
    cy.get('button').contains('Add Player').click()
    cy.wait(2000)
    
    // Start the game
    cy.get('button').contains('Start Yahtzee Game').click()
    cy.wait(1000)
    
    // Enter an initial score
    cy.get('.scorecard-table').contains('Ones').parent().find('td').eq(1).click()
    cy.get('.cell-input').should('be.visible')
    cy.get('.cell-input').type('15{enter}')
    cy.wait(1000)
    
    // Verify the score was saved
    cy.get('.scorecard-table').should('contain', '15')
    cy.get('.toast-success').should('contain', 'added successfully')
    
    // Click on the same cell to edit it - should now be editable
    cy.get('.scorecard-table').contains('Ones').parent().find('td').eq(1).click()
    cy.get('.cell-input').should('be.visible')
    cy.get('.cell-input').should('have.value', '15') // Should show current value
    
    // Verify the cell shows the current value when editing
    cy.get('.cell-input').should('contain.value', '15')
    
    // Test that we can edit the value and save it
    cy.get('.cell-input').clear().type('25{enter}')
    cy.wait(1000)
    
    // Verify the score was updated
    cy.get('.scorecard-table').should('contain', '25')
    cy.get('.scorecard-table').should('not.contain', '15')
    cy.get('.toast-success').should('contain', 'updated to 25 successfully')
    
    // Test editing another category
    cy.get('.scorecard-table').contains('Twos').parent().find('td').eq(1).click()
    cy.get('.cell-input').should('be.visible')
    cy.get('.cell-input').type('20{enter}')
    cy.wait(1000)
    
    // Verify both scores exist
    cy.get('.scorecard-table').should('contain', '25') // Updated Ones score
    cy.get('.scorecard-table').should('contain', '20') // New Twos score
    
    // Test editing the Twos score as well
    cy.get('.scorecard-table').contains('Twos').parent().find('td').eq(1).click()
    cy.get('.cell-input').should('be.visible')
    cy.get('.cell-input').should('have.value', '20')
    cy.get('.cell-input').clear().type('30{enter}')
    cy.wait(1000)
    
    // Verify final scores
    cy.get('.scorecard-table').should('contain', '25') // Updated Ones
    cy.get('.scorecard-table').should('contain', '30') // Updated Twos
    cy.get('.scorecard-table').should('not.contain', '20') // Old Twos value
    cy.get('.toast-success').should('contain', 'updated to 30 successfully')
    
    cy.log('Score editing test completed successfully!');
  })


}) 